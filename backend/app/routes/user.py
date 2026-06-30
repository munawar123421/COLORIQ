from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.image import ImageProcessing, ProcessingStatus
from app.routes.auth import get_current_user
from app.utils.password import hash_password, verify_password

router = APIRouter()

# Pydantic models
class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    status: str
    email_verified: bool
    created_at: str
    last_login: Optional[str]
    total_uploads: int
    successful_uploads: int
    failed_uploads: int
    success_rate: float

class UserProfileUpdate(BaseModel):
    name: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile with statistics"""
    
    # Get user statistics
    total_uploads = db.query(ImageProcessing).filter(
        ImageProcessing.user_id == current_user.id
    ).count()
    
    successful_uploads = db.query(ImageProcessing).filter(
        ImageProcessing.user_id == current_user.id,
        ImageProcessing.status == ProcessingStatus.COMPLETED.value
    ).count()
    
    failed_uploads = db.query(ImageProcessing).filter(
        ImageProcessing.user_id == current_user.id,
        ImageProcessing.status == ProcessingStatus.FAILED.value
    ).count()
    
    success_rate = (successful_uploads / total_uploads * 100) if total_uploads > 0 else 0.0
    
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role.value,
        status=current_user.status.value,
        email_verified=current_user.email_verified,
        created_at=current_user.created_at.isoformat(),
        last_login=current_user.last_login.isoformat() if current_user.last_login else None,
        total_uploads=total_uploads,
        successful_uploads=successful_uploads,
        failed_uploads=failed_uploads,
        success_rate=round(success_rate, 1)
    )

@router.put("/profile", response_model=dict)
async def update_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile (name only)"""
    
    # Validate name
    if not profile_update.name or len(profile_update.name.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name must be at least 2 characters long"
        )
    
    # Update user
    current_user.name = profile_update.name.strip()
    current_user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Profile updated successfully",
        "user": current_user.to_dict()
    }

@router.post("/change-password", response_model=dict)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if len(password_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long"
        )
    
    # Check if new password is same as current
    if verify_password(password_data.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )
    
    # Update password
    current_user.password_hash = hash_password(password_data.new_password)
    current_user.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Password changed successfully"
    }