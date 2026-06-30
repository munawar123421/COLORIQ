"""
AI Color Correction Service
Handles image processing using the trained ColorIQ model
"""
import os
import io
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from PIL import Image
from torchvision import transforms
from torchvision.transforms import functional as TF
from typing import Tuple, Optional

# Define the UNet model architecture (same as in improved_model.py)
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


class AIColorCorrectionService:
    """Service for AI-powered color correction"""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        
        # Path to the trained model - go up from backend/app/services to project root
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        AI_MODEL_DIR = os.path.join(project_root, 'ai_model')
        self.model_path = os.path.join(AI_MODEL_DIR, 'coloriq_best.pth')
        
        self.transform = transforms.Compose([transforms.ToTensor()])
        self.to_pil = transforms.ToPILImage()
        
        print(f"🤖 AI Service initialized on device: {self.device}")
        print(f"📁 Model path: {self.model_path}")
        
    def load_model(self) -> None:
        """Load the trained model"""
        if self.model is not None:
            return
            
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        
        try:
            self.model = UNet().to(self.device)
            state_dict = torch.load(self.model_path, map_location=self.device)
            self.model.load_state_dict(state_dict)
            self.model.eval()
            print(f"✅ Model loaded successfully from {self.model_path}")
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            raise
    
    def preprocess_image(self, image: Image.Image, max_side: int = 1024) -> Tuple[torch.Tensor, Tuple[int, int], int, int]:
        """
        Preprocess image for inference (based on infer_trained.py logic)
        
        Args:
            image: PIL Image
            max_side: Maximum dimension size
            
        Returns:
            Tuple of (preprocessed tensor, original size, original height, original width)
        """
        original_size = image.size
        inference_img = image
        
        # Resize if too large (to avoid GPU memory issues)
        ow, oh = image.size
        longest = max(ow, oh)
        if longest > max_side:
            scale = max_side / float(longest)
            nw = max(1, int(round(ow * scale)))
            nh = max(1, int(round(oh * scale)))
            inference_img = image.resize((nw, nh), Image.Resampling.BICUBIC)
            print(f"📏 Resized for inference: {ow}x{oh} -> {nw}x{nh}")
        
        # Convert to tensor
        input_tensor = self.transform(inference_img).unsqueeze(0)
        
        # Pad to multiple of 8 (UNet requirement - downsamples 3 times)
        _, _, h, w = input_tensor.shape
        pad_h = (8 - (h % 8)) % 8
        pad_w = (8 - (w % 8)) % 8
        
        original_h = h
        original_w = w
        
        if pad_h or pad_w:
            input_tensor = TF.pad(input_tensor, [0, 0, pad_w, pad_h], fill=0)
        
        return input_tensor, original_size, original_h, original_w
    
    def postprocess_image(self, output_tensor: torch.Tensor, original_size: Tuple[int, int], 
                         original_height: int, original_width: int) -> Image.Image:
        """
        Postprocess model output to PIL Image (based on infer_trained.py logic)
        
        Args:
            output_tensor: Model output tensor
            original_size: Original image size (width, height)
            original_height: Height before padding
            original_width: Width before padding
            
        Returns:
            PIL Image
        """
        # Remove padding and clamp values
        corrected = output_tensor.squeeze(0).cpu().clamp(0, 1)
        corrected = corrected[:, :original_height, :original_width]
        
        # Convert to PIL
        corrected_img = self.to_pil(corrected)
        
        # Resize back to original size if needed
        if corrected_img.size != original_size:
            corrected_img = corrected_img.resize(original_size, Image.Resampling.BICUBIC)
        
        return corrected_img
    
    def correct_image(self, image: Image.Image) -> Tuple[Image.Image, Optional[np.ndarray]]:
        """
        Perform color correction on an image (based on infer_trained.py logic)
        
        Args:
            image: PIL Image to correct
            
        Returns:
            Tuple of (corrected image, heatmap array or None)
        """
        # Ensure model is loaded
        if self.model is None:
            self.load_model()
        
        # Preprocess
        input_tensor, original_size, original_h, original_w = self.preprocess_image(image)
        input_tensor = input_tensor.to(self.device)
        
        # Inference with automatic fallback to CPU on OOM
        with torch.no_grad():
            try:
                if self.device.type == 'cuda':
                    with torch.autocast(device_type='cuda', dtype=torch.float16):
                        corrected = self.model(input_tensor)
                else:
                    corrected = self.model(input_tensor)
            except torch.cuda.OutOfMemoryError:
                print("⚠️ CUDA OOM, falling back to CPU...")
                torch.cuda.empty_cache()
                self.model = self.model.to('cpu')
                input_tensor = input_tensor.to('cpu')
                self.device = torch.device('cpu')
                corrected = self.model(input_tensor)
        
        # Postprocess
        corrected_img = self.postprocess_image(corrected, original_size, original_h, original_w)
        
        # Generate heatmap (difference between original and corrected)
        heatmap = self.generate_heatmap(image, corrected_img)
        
        return corrected_img, heatmap
    
    def generate_heatmap(self, original: Image.Image, corrected: Image.Image) -> np.ndarray:
        """
        Generate a heatmap showing differences between original and corrected images
        
        Args:
            original: Original PIL Image
            corrected: Corrected PIL Image
            
        Returns:
            Heatmap as numpy array
        """
        try:
            # Ensure same size
            if original.size != corrected.size:
                corrected = corrected.resize(original.size, Image.Resampling.BICUBIC)
            
            # Convert to numpy arrays
            orig_array = np.array(original).astype(np.float32) / 255.0
            corr_array = np.array(corrected).astype(np.float32) / 255.0
            
            # Calculate absolute difference
            diff = np.abs(orig_array - corr_array)
            
            # Convert to grayscale (average across RGB channels)
            diff_gray = np.mean(diff, axis=2)
            
            # Normalize to 0-255
            heatmap = (diff_gray * 255).astype(np.uint8)
            
            return heatmap
            
        except Exception as e:
            print(f"⚠️ Error generating heatmap: {str(e)}")
            return None
    
    def process_image_bytes(self, image_bytes: bytes) -> Tuple[bytes, bytes, Optional[bytes]]:
        """
        Process image from bytes and return corrected image and heatmap as bytes
        
        Args:
            image_bytes: Input image as bytes
            
        Returns:
            Tuple of (original bytes, corrected bytes, heatmap bytes or None)
        """
        # Load image from bytes
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Perform correction
        corrected_img, heatmap = self.correct_image(image)
        
        # Convert corrected image to bytes
        corrected_buffer = io.BytesIO()
        corrected_img.save(corrected_buffer, format='JPEG', quality=95)
        corrected_bytes = corrected_buffer.getvalue()
        
        # Convert heatmap to bytes if available
        heatmap_bytes = None
        if heatmap is not None:
            heatmap_img = Image.fromarray(heatmap)
            heatmap_buffer = io.BytesIO()
            heatmap_img.save(heatmap_buffer, format='PNG')
            heatmap_bytes = heatmap_buffer.getvalue()
        
        return image_bytes, corrected_bytes, heatmap_bytes


# Global service instance
ai_service = AIColorCorrectionService()
