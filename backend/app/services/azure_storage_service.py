"""
Azure Blob Storage Service
Handles image upload/download to Azure Blob Storage
"""
import os
import io
from datetime import datetime, timedelta
from typing import Optional, Tuple
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions, ContentSettings
from dotenv import load_dotenv

load_dotenv()

class AzureStorageService:
    """Service for Azure Blob Storage operations"""
    
    def __init__(self):
        self.connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.container_original = os.getenv("AZURE_STORAGE_CONTAINER_ORIGINAL", "original-images")
        self.container_corrected = os.getenv("AZURE_STORAGE_CONTAINER_CORRECTED", "corrected-images")
        self.container_heatmaps = os.getenv("AZURE_STORAGE_CONTAINER_HEATMAPS", "heatmaps")
        
        if not self.connection_string:
            raise ValueError("AZURE_STORAGE_CONNECTION_STRING not found in environment variables")
        
        self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
        
        # Extract account name and key for SAS token generation
        self.account_name = self._extract_account_name()
        self.account_key = self._extract_account_key()
        
        print("✅ Azure Storage Service initialized")
    
    def _extract_account_name(self) -> str:
        """Extract account name from connection string"""
        for part in self.connection_string.split(';'):
            if 'AccountName=' in part:
                return part.split('=')[1]
        return ""
    
    def _extract_account_key(self) -> str:
        """Extract account key from connection string"""
        for part in self.connection_string.split(';'):
            if 'AccountKey=' in part:
                key = part.split('=', 1)[1]
                # Remove any whitespace or newlines
                return key.strip()
        return ""
    
    def generate_blob_name(self, user_id: str, filename: str, suffix: str = "") -> str:
        """
        Generate a unique blob name
        
        Args:
            user_id: User ID
            filename: Original filename
            suffix: Optional suffix (e.g., '-corrected', '-heatmap')
            
        Returns:
            Blob name in format: user-{user_id}/{timestamp}-{filename}{suffix}
        """
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(filename)
        blob_name = f"user-{user_id}/{timestamp}-{name}{suffix}{ext}"
        return blob_name
    
    def upload_image(self, container_name: str, blob_name: str, image_bytes: bytes, 
                    content_type: str = "image/jpeg") -> str:
        """
        Upload image to Azure Blob Storage
        
        Args:
            container_name: Container name
            blob_name: Blob name
            image_bytes: Image data as bytes
            content_type: MIME type
            
        Returns:
            Blob URL
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            
            # Create ContentSettings object
            content_settings = ContentSettings(content_type=content_type)
            
            # Upload with content settings
            blob_client.upload_blob(
                image_bytes,
                overwrite=True,
                content_settings=content_settings
            )
            
            return blob_client.url
            
        except Exception as e:
            print(f"❌ Error uploading to Azure: {str(e)}")
            raise
    
    def download_image(self, container_name: str, blob_name: str) -> bytes:
        """
        Download image from Azure Blob Storage
        
        Args:
            container_name: Container name
            blob_name: Blob name
            
        Returns:
            Image data as bytes
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            
            return blob_client.download_blob().readall()
            
        except Exception as e:
            print(f"❌ Error downloading from Azure: {str(e)}")
            raise
    
    def generate_sas_url(self, container_name: str, blob_name: str, expiry_hours: int = 24) -> str:
        """
        Generate a SAS URL for temporary access to a blob
        
        Args:
            container_name: Container name
            blob_name: Blob name
            expiry_hours: Hours until expiry
            
        Returns:
            SAS URL or direct blob URL if SAS generation fails
        """
        try:
            # Validate account key
            if not self.account_key or len(self.account_key) < 10:
                print(f"⚠️ Invalid account key, using direct blob URL")
                blob_client = self.blob_service_client.get_blob_client(
                    container=container_name,
                    blob=blob_name
                )
                return blob_client.url
            
            sas_token = generate_blob_sas(
                account_name=self.account_name,
                container_name=container_name,
                blob_name=blob_name,
                account_key=self.account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=expiry_hours)
            )
            
            blob_url = f"https://{self.account_name}.blob.core.windows.net/{container_name}/{blob_name}?{sas_token}"
            return blob_url
            
        except Exception as e:
            print(f"⚠️ Error generating SAS URL: {str(e)}")
            print(f"⚠️ Falling back to direct blob URL (may require public access)")
            
            # Fallback: return direct blob URL
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            return blob_client.url
    
    def upload_processed_images(self, user_id: str, filename: str, 
                               original_bytes: bytes, corrected_bytes: bytes, 
                               heatmap_bytes: Optional[bytes] = None) -> Tuple[str, str, Optional[str]]:
        """
        Upload original, corrected, and heatmap images
        
        Args:
            user_id: User ID
            filename: Original filename
            original_bytes: Original image bytes
            corrected_bytes: Corrected image bytes
            heatmap_bytes: Heatmap image bytes (optional)
            
        Returns:
            Tuple of (original_url, corrected_url, heatmap_url)
        """
        # Generate blob names
        original_blob = self.generate_blob_name(user_id, filename)
        corrected_blob = self.generate_blob_name(user_id, filename, suffix="-corrected")
        heatmap_blob = self.generate_blob_name(user_id, filename, suffix="-heatmap") if heatmap_bytes else None
        
        # Upload original
        original_url = self.upload_image(self.container_original, original_blob, original_bytes)
        print(f"✅ Uploaded original: {original_blob}")
        
        # Upload corrected
        corrected_url = self.upload_image(self.container_corrected, corrected_blob, corrected_bytes)
        print(f"✅ Uploaded corrected: {corrected_blob}")
        
        # Upload heatmap if available
        heatmap_url = None
        if heatmap_bytes and heatmap_blob:
            heatmap_url = self.upload_image(self.container_heatmaps, heatmap_blob, heatmap_bytes, "image/png")
            print(f"✅ Uploaded heatmap: {heatmap_blob}")
        
        # Generate SAS URLs for temporary access
        original_sas = self.generate_sas_url(self.container_original, original_blob)
        corrected_sas = self.generate_sas_url(self.container_corrected, corrected_blob)
        heatmap_sas = self.generate_sas_url(self.container_heatmaps, heatmap_blob) if heatmap_blob else None
        
        return original_sas, corrected_sas, heatmap_sas
    
    def delete_image(self, container_name: str, blob_name: str) -> bool:
        """
        Delete image from Azure Blob Storage
        
        Args:
            container_name: Container name
            blob_name: Blob name
            
        Returns:
            True if successful
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            
            blob_client.delete_blob()
            print(f"✅ Deleted blob: {blob_name}")
            return True
            
        except Exception as e:
            print(f"❌ Error deleting from Azure: {str(e)}")
            return False


# Global service instance
azure_storage_service = AzureStorageService()
