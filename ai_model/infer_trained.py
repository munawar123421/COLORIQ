import argparse
import os
from tkinter import Tk, filedialog
from typing import Optional

import matplotlib.pyplot as plt
import torch
from PIL import Image
from torchvision import transforms
from torchvision.transforms import functional as TF

from improved_model import UNet


def load_model(model_path: str, device: torch.device) -> UNet:
    model = UNet().to(device)
    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)
    model.eval()
    return model


def pick_image_file() -> str:
    root = Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    file_path = filedialog.askopenfilename(
        title="1.jpg",
        filetypes=[("Image files", "*.png;*.jpg;*.jpeg;*.bmp;*.tif;*.tiff;*.webp")],
    )
    root.destroy()
    if not file_path:
        raise FileNotFoundError("No image selected.")
    return file_path


def infer_one_image(model: UNet, image_path: str, device: torch.device) -> tuple[Image.Image, Image.Image]:
    transform = transforms.Compose([transforms.ToTensor()])

    to_pil = transforms.ToPILImage()

    with Image.open(image_path).convert("RGB") as img:
        original_img = img.copy()
        inference_img = original_img

        # High-resolution images can exceed GPU memory in UNet skip connections.
        max_side = 1024
        ow, oh = original_img.size
        longest = max(ow, oh)
        if longest > max_side:
            scale = max_side / float(longest)
            nw = max(1, int(round(ow * scale)))
            nh = max(1, int(round(oh * scale)))
            inference_img = original_img.resize((nw, nh), Image.Resampling.BICUBIC)
            print(f"Resized input for inference: {ow}x{oh} -> {nw}x{nh}")

        input_tensor = transform(inference_img).unsqueeze(0)

    _, _, h, w = input_tensor.shape
    pad_h = (8 - (h % 8)) % 8
    pad_w = (8 - (w % 8)) % 8

    if pad_h or pad_w:
        # UNet downsamples 3 times; pad to multiple of 8 to keep exact alignment.
        input_tensor = TF.pad(input_tensor, [0, 0, pad_w, pad_h], fill=0)

    input_tensor = input_tensor.to(device)

    with torch.no_grad():
        try:
            if device.type == "cuda":
                with torch.autocast(device_type="cuda", dtype=torch.float16):
                    corrected = model(input_tensor).squeeze(0).cpu().clamp(0, 1)
            else:
                corrected = model(input_tensor).squeeze(0).cpu().clamp(0, 1)
        except torch.OutOfMemoryError:
            if device.type != "cuda":
                raise

            print("CUDA OOM during inference. Falling back to CPU for this image...")
            torch.cuda.empty_cache()
            model = model.to("cpu")
            input_tensor = input_tensor.to("cpu")
            corrected = model(input_tensor).squeeze(0).cpu().clamp(0, 1)

    corrected = corrected[:, :h, :w]

    corrected_img = to_pil(corrected)
    if corrected_img.size != original_img.size:
        corrected_img = corrected_img.resize(original_img.size, Image.Resampling.BICUBIC)

    return original_img, corrected_img


def show_comparison(original_img: Image.Image, corrected_img: Image.Image) -> None:
    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    plt.title("Original")
    plt.imshow(original_img)
    plt.axis("off")

    plt.subplot(1, 2, 2)
    plt.title("Corrected")
    plt.imshow(corrected_img)
    plt.axis("off")

    plt.tight_layout()
    plt.show()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Single image inference with side-by-side comparison.")
    parser.add_argument("--model", default="coloriq_best.pth", help="Path to trained model weights.")
    parser.add_argument("--image", default=None, help="Optional image path. If not provided, a file dialog opens.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if not os.path.exists(args.model):
        raise FileNotFoundError(f"Model file not found: {args.model}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    model = load_model(args.model, device)
    image_path: Optional[str] = args.image if args.image else pick_image_file()
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")

    original_img, corrected_img = infer_one_image(model, image_path, device)
    show_comparison(original_img, corrected_img)


if __name__ == "__main__":
    main()
