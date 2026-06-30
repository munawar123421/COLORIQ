# ===============================
# ColorIQ-Net (FINAL STABLE VERSION)
# ===============================

import argparse
import os
import random

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from PIL import Image, ImageFile
from torch.utils.data import DataLoader, Dataset, Subset
from torchvision import models, transforms
from torchvision.transforms import functional as TF
from tqdm import tqdm

# 🔥 IMPORTANT (fix truncated images)
ImageFile.LOAD_TRUNCATED_IMAGES = True


# ===============================
# 1. MODEL
# ===============================
class ConvBlock(nn.Module):
    def __init__(self, in_c, out_c):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_c, out_c, 3, padding=1),
            nn.BatchNorm2d(out_c),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_c, out_c, 3, padding=1),
            nn.BatchNorm2d(out_c),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.block(x)


class UNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.enc1 = ConvBlock(3, 64)
        self.enc2 = ConvBlock(64, 128)
        self.enc3 = ConvBlock(128, 256)

        self.pool = nn.MaxPool2d(2)
        self.bottleneck = ConvBlock(256, 512)

        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = ConvBlock(512, 256)

        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = ConvBlock(256, 128)

        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = ConvBlock(128, 64)

        self.final = nn.Conv2d(64, 3, 1)

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))

        b = self.bottleneck(self.pool(e3))

        d3 = self.up3(b)
        d3 = torch.cat([d3, e3], dim=1)
        d3 = self.dec3(d3)

        d2 = self.up2(d3)
        d2 = torch.cat([d2, e2], dim=1)
        d2 = self.dec2(d2)

        d1 = self.up1(d2)
        d1 = torch.cat([d1, e1], dim=1)
        d1 = self.dec1(d1)

        out = torch.tanh(self.final(d1))
        return torch.clamp(x + out, 0, 1)


def edge_loss(pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
    # Edge-aware term helps preserve structure and reduce over-smoothing.
    sobel_x = torch.tensor(
        [[[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]],
        dtype=pred.dtype,
        device=pred.device,
    ).unsqueeze(1)
    sobel_y = torch.tensor(
        [[[-1, -2, -1], [0, 0, 0], [1, 2, 1]]],
        dtype=pred.dtype,
        device=pred.device,
    ).unsqueeze(1)

    sobel_x = sobel_x.repeat(3, 1, 1, 1)
    sobel_y = sobel_y.repeat(3, 1, 1, 1)

    pred_x = F.conv2d(pred, sobel_x, padding=1, groups=3)
    pred_y = F.conv2d(pred, sobel_y, padding=1, groups=3)
    tgt_x = F.conv2d(target, sobel_x, padding=1, groups=3)
    tgt_y = F.conv2d(target, sobel_y, padding=1, groups=3)

    return F.l1_loss(pred_x, tgt_x) + F.l1_loss(pred_y, tgt_y)


# ===============================
# 2. PERCEPTUAL LOSS
# ===============================
class PerceptualLoss(nn.Module):
    def __init__(self):
        super().__init__()
        vgg = models.vgg16(weights=models.VGG16_Weights.IMAGENET1K_V1).features[:16].eval()
        for p in vgg.parameters():
            p.requires_grad = False
        self.vgg = vgg
        self.l1 = nn.L1Loss()

    def normalize(self, x):
        mean = torch.tensor([0.485, 0.456, 0.406]).view(1,3,1,1).to(x.device)
        std  = torch.tensor([0.229, 0.224, 0.225]).view(1,3,1,1).to(x.device)
        return (x - mean) / std

    def forward(self, x, y):
        return self.l1(self.vgg(self.normalize(x)), self.vgg(self.normalize(y)))


# ===============================
# 3. DATASET (CRASH-PROOF)
# ===============================
class WBDataset(Dataset):
    def __init__(self, input_dir, gt_dir, patch_size=512, training=True):
        self.input_dir = input_dir
        self.gt_dir = gt_dir
        self.patch_size = patch_size
        self.training = training

        self.to_tensor = transforms.ToTensor()

        # base function
        def get_base(filename):
            name = filename.split('.')[0]
            parts = name.split('_')
            return "_".join(parts[:-2])

        # GT map
        self.gt_map = {}
        for gt in os.listdir(gt_dir):
            if gt.endswith(".png"):
                base = get_base(gt)
                self.gt_map[base] = gt

        # pairs
        self.pairs = []
        for inp in os.listdir(input_dir):
            if inp.endswith(".png"):
                base = get_base(inp)
                if base in self.gt_map:
                    self.pairs.append((inp, self.gt_map[base]))

        print(f"✅ Total pairs: {len(self.pairs)}")

    def __len__(self):
        return len(self.pairs)

    def __getitem__(self, idx):
        for _ in range(10):  # try multiple times
            inp_name, gt_name = self.pairs[idx]

            inp_path = os.path.join(self.input_dir, inp_name)
            gt_path = os.path.join(self.gt_dir, gt_name)

            try:
                inp = Image.open(inp_path).convert('RGB')
                tgt = Image.open(gt_path).convert('RGB')

                if self.training and random.random() < 0.5:
                    inp = TF.hflip(inp)
                    tgt = TF.hflip(tgt)

                w, h = inp.size
                min_side = min(w, h)

                if min_side < self.patch_size:
                    scale = self.patch_size / float(min_side)
                    new_w = int(round(w * scale))
                    new_h = int(round(h * scale))
                    inp = TF.resize(inp, (new_h, new_w), interpolation=Image.Resampling.BICUBIC)
                    tgt = TF.resize(tgt, (new_h, new_w), interpolation=Image.Resampling.BICUBIC)
                    w, h = inp.size

                if self.training:
                    i, j, th, tw = transforms.RandomCrop.get_params(inp, (self.patch_size, self.patch_size))
                    inp = TF.crop(inp, i, j, th, tw)
                    tgt = TF.crop(tgt, i, j, th, tw)
                else:
                    i = max((h - self.patch_size) // 2, 0)
                    j = max((w - self.patch_size) // 2, 0)
                    inp = TF.crop(inp, i, j, self.patch_size, self.patch_size)
                    tgt = TF.crop(tgt, i, j, self.patch_size, self.patch_size)

                return self.to_tensor(inp), self.to_tensor(tgt)

            except Exception:
                # pick random index if corrupted
                idx = random.randint(0, len(self.pairs) - 1)

        # fallback (rare case)
        return torch.zeros(3, self.patch_size, self.patch_size), torch.zeros(3, self.patch_size, self.patch_size)


# ===============================
# 4. TRAINING
# ===============================
def resolve_dataset_paths() -> tuple[str, str]:
    candidates = [
        ("dataset/input", "dataset/gt"),
        ("Dataset/input", "Dataset/gt"),
    ]
    for inp_dir, gt_dir in candidates:
        if os.path.isdir(inp_dir) and os.path.isdir(gt_dir):
            return inp_dir, gt_dir
    raise FileNotFoundError("Could not find dataset folders. Expected dataset/input+dataset/gt or Dataset/input+Dataset/gt")


def set_seed(seed: int = 42) -> None:
    random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def train(args: argparse.Namespace):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")
    torch.backends.cudnn.benchmark = True
    set_seed(args.seed)

    model = UNet().to(device)

    input_dir, gt_dir = resolve_dataset_paths()
    train_dataset = WBDataset(input_dir, gt_dir, patch_size=args.patch_size, training=True)
    val_dataset = WBDataset(input_dir, gt_dir, patch_size=args.patch_size, training=False)

    total_size = len(train_dataset)
    val_size = int(0.2 * total_size)
    train_size = total_size - val_size
    indices = list(range(total_size))
    random.shuffle(indices)
    train_indices = indices[:train_size]
    val_indices = indices[train_size:]
    train_ds = Subset(train_dataset, train_indices)
    val_ds = Subset(val_dataset, val_indices)

    train_loader = DataLoader(
        train_ds,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.num_workers,
        pin_memory=(device == 'cuda'),
        persistent_workers=(args.num_workers > 0),
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=max(1, args.batch_size // 2),
        num_workers=args.num_workers,
        pin_memory=(device == 'cuda'),
        persistent_workers=(args.num_workers > 0),
    )

    l1_loss = nn.L1Loss()
    perc_loss = PerceptualLoss().to(device)

    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-6)
    scaler = torch.amp.GradScaler(enabled=(device == 'cuda'))

    best_loss = float('inf')
    epochs = min(args.epochs, 50)

    print(f"Training pairs: {train_size} | Validation pairs: {val_size}")
    print(f"Patch size: {args.patch_size}, Batch: {args.batch_size}, Epochs: {epochs}")

    for epoch in range(epochs):
        # TRAIN
        model.train()
        train_loss = 0

        for inp, tgt in tqdm(train_loader, desc=f"Train {epoch+1}/{epochs}"):
            inp, tgt = inp.to(device), tgt.to(device)

            optimizer.zero_grad()

            with torch.amp.autocast(device_type='cuda', enabled=(device == 'cuda')):
                out = model(inp)
                rec = l1_loss(out, tgt)
                perc = perc_loss(out, tgt)
                edge = edge_loss(out, tgt)
                loss = rec + 0.1 * perc + 0.05 * edge

            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            scaler.step(optimizer)
            scaler.update()

            train_loss += loss.item()

        # VALIDATION
        model.eval()
        val_loss = 0

        with torch.no_grad():
            for inp, tgt in val_loader:
                inp, tgt = inp.to(device), tgt.to(device)
                out = model(inp)
                rec = l1_loss(out, tgt)
                perc = perc_loss(out, tgt)
                edge = edge_loss(out, tgt)
                val_loss += (rec + 0.1 * perc + 0.05 * edge).item()

        scheduler.step()

        avg_train = train_loss / len(train_loader)
        avg_val = val_loss / len(val_loader)

        print(f"\nEpoch {epoch+1}")
        print(f"Train Loss: {avg_train:.5f}")
        print(f"Val Loss:   {avg_val:.5f}")

        # save best
        if avg_val < best_loss:
            best_loss = avg_val
            torch.save(model.state_dict(), 'coloriq_best.pth')
            print("💾 Saved Best Model")

        torch.save(model.state_dict(), 'coloriq_last.pth')

    print("✅ Training Completed!")


# ===============================
# 5. RUN
# ===============================
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='High-quality ColorIQ training')
    parser.add_argument('--epochs', type=int, default=50)
    parser.add_argument('--batch-size', type=int, default=2)
    parser.add_argument('--patch-size', type=int, default=512)
    parser.add_argument('--lr', type=float, default=2e-4)
    parser.add_argument('--num-workers', type=int, default=4)
    parser.add_argument('--seed', type=int, default=42)
    return parser.parse_args()


if __name__ == '__main__':
    train(parse_args())