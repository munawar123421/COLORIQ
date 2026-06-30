"""
Image processing database model
"""
from sqlalchemy import Column, String, DateTime, Integer, Float, Text, ForeignKey
from datetime import datetime
import enum

from app.database import Base

class ProcessingStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ImageProcessing(Base):
    __tablename__ = "image_processing"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey('users.id'), nullable=False, index=True)
    
    # File information
    original_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    
    # Azure Blob URLs
    original_url = Column(Text, nullable=False)
    corrected_url = Column(Text, nullable=True)
    heatmap_url = Column(Text, nullable=True)
    
    # Processing information
    status = Column(String(20), default=ProcessingStatus.PENDING.value, nullable=False)
    processing_time = Column(Float, nullable=True)  # in seconds
    error_message = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "original_filename": self.original_filename,
            "file_size": self.file_size,
            "original_url": self.original_url,
            "corrected_url": self.corrected_url,
            "heatmap_url": self.heatmap_url,
            "status": self.status,
            "processing_time": self.processing_time,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
