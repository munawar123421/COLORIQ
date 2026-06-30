"""
Image processing API routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import time
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.image import ImageProcessing, ProcessingStatus
from app.routes.auth import get_current_user
from app.services.ai_service import ai_service
from app.services.azure_storage_service import azure_storage_service

router = APIRouter()
security = HTTPBearer()

# Allowed image extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def validate_image_file(file: UploadFile) -> None:
    """Validate uploaded image file"""
    # Check extension
    filename_lower = file.filename.lower()
    if not any(filename_lower.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check content type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content type. Must be an image."
        )

@router.post("/upload", response_model=dict)
async def upload_and_process_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and process an image for color correction
    
    Steps:
    1. Validate image
    2. Read image bytes
    3. Process with AI model
    4. Upload to Azure (original, corrected, heatmap)
    5. Save record to database
    6. Return URLs
    """
    
    # Validate file
    validate_image_file(file)
    
    # Read file
    image_bytes = await file.read()
    file_size = len(image_bytes)
    
    # Check file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024):.1f} MB"
        )
    
    # Create database record
    processing_id = str(uuid.uuid4())
    processing_record = ImageProcessing(
        id=processing_id,
        user_id=current_user.id,
        original_filename=file.filename,
        file_size=file_size,
        original_url="",  # Will be updated after upload
        status=ProcessingStatus.PROCESSING.value,
        created_at=datetime.utcnow()
    )
    
    db.add(processing_record)
    db.commit()
    
    try:
        # Process image with AI
        start_time = time.time()
        print(f"🎨 Processing image: {file.filename} for user: {current_user.email}")
        
        original_bytes, corrected_bytes, heatmap_bytes = ai_service.process_image_bytes(image_bytes)
        
        processing_time = time.time() - start_time
        print(f"✅ AI processing completed in {processing_time:.2f}s")
        
        # Upload to Azure
        print(f"☁️ Uploading to Azure Blob Storage...")
        original_url, corrected_url, heatmap_url = azure_storage_service.upload_processed_images(
            user_id=current_user.id,
            filename=file.filename,
            original_bytes=original_bytes,
            corrected_bytes=corrected_bytes,
            heatmap_bytes=heatmap_bytes
        )
        
        # Update database record
        processing_record.original_url = original_url
        processing_record.corrected_url = corrected_url
        processing_record.heatmap_url = heatmap_url
        processing_record.status = ProcessingStatus.COMPLETED.value
        processing_record.processing_time = processing_time
        processing_record.completed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(processing_record)
        
        print(f"✅ Processing completed: {processing_id}")
        
        return {
            "message": "Image processed successfully",
            "processing_id": processing_id,
            "original_url": original_url,
            "corrected_url": corrected_url,
            "heatmap_url": heatmap_url,
            "processing_time": processing_time,
            "status": ProcessingStatus.COMPLETED.value
        }
        
    except Exception as e:
        # Update record with error
        processing_record.status = ProcessingStatus.FAILED.value
        processing_record.error_message = str(e)
        db.commit()
        
        print(f"❌ Processing failed: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image processing failed: {str(e)}"
        )

@router.get("/history", response_model=List[dict])
async def get_processing_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """Get user's image processing history"""
    
    records = db.query(ImageProcessing)\
        .filter(ImageProcessing.user_id == current_user.id)\
        .order_by(ImageProcessing.created_at.desc())\
        .limit(limit)\
        .offset(offset)\
        .all()
    
    return [record.to_dict() for record in records]

@router.get("/{processing_id}", response_model=dict)
async def get_processing_result(
    processing_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific processing result"""
    
    record = db.query(ImageProcessing)\
        .filter(
            ImageProcessing.id == processing_id,
            ImageProcessing.user_id == current_user.id
        )\
        .first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Processing record not found"
        )
    
    return record.to_dict()

@router.delete("/{processing_id}", response_model=dict)
async def delete_processing_result(
    processing_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete processing result and associated images"""
    
    record = db.query(ImageProcessing)\
        .filter(
            ImageProcessing.id == processing_id,
            ImageProcessing.user_id == current_user.id
        )\
        .first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Processing record not found"
        )
    
    # Delete from database
    db.delete(record)
    db.commit()
    
    # Note: Azure blob deletion can be added here if needed
    # For now, we keep the blobs for data retention
    
    return {
        "message": "Processing record deleted successfully",
        "processing_id": processing_id
    }

@router.get("/stats/summary", response_model=dict)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's processing statistics"""
    
    total_processed = db.query(ImageProcessing)\
        .filter(ImageProcessing.user_id == current_user.id)\
        .count()
    
    completed = db.query(ImageProcessing)\
        .filter(
            ImageProcessing.user_id == current_user.id,
            ImageProcessing.status == ProcessingStatus.COMPLETED.value
        )\
        .count()
    
    failed = db.query(ImageProcessing)\
        .filter(
            ImageProcessing.user_id == current_user.id,
            ImageProcessing.status == ProcessingStatus.FAILED.value
        )\
        .count()
    
    # Get average processing time
    avg_time_result = db.query(ImageProcessing.processing_time)\
        .filter(
            ImageProcessing.user_id == current_user.id,
            ImageProcessing.processing_time.isnot(None)
        )\
        .all()
    
    avg_processing_time = sum(r[0] for r in avg_time_result) / len(avg_time_result) if avg_time_result else 0
    
    return {
        "total_processed": total_processed,
        "completed": completed,
        "failed": failed,
        "success_rate": (completed / total_processed * 100) if total_processed > 0 else 0,
        "average_processing_time": round(avg_processing_time, 2)
    }
