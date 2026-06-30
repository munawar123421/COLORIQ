from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.models.image import ImageProcessing, ProcessingStatus
from app.routes.auth import get_current_user, require_admin

router = APIRouter()

# Pydantic models
class SystemAnalytics(BaseModel):
    total_users: int
    active_users: int
    total_uploads: int
    successful_uploads: int
    failed_uploads: int
    success_rate: float
    daily_uploads: int
    weekly_uploads: int
    monthly_uploads: int
    average_processing_time: float
    processing_queue: int
    error_rate_24h: float
    storage_usage_gb: float
    failed_logins_24h: int

class MostActiveUser(BaseModel):
    user_id: str
    user_name: str
    user_email: str
    upload_count: int
    last_upload: str

class QuickAction(BaseModel):
    id: str
    title: str
    description: str
    action_type: str
    count: Optional[int] = None

class UserInfo(BaseModel):
    id: str
    email: str
    name: str
    role: str
    status: str
    email_verified: bool
    created_at: str
    last_login: Optional[str]
    total_uploads: int

class UploadInfo(BaseModel):
    id: str
    user_id: str
    user_email: str
    user_name: str
    original_filename: str
    status: str
    processing_time: Optional[float]
    file_size: int
    created_at: str

class SystemHealth(BaseModel):
    api_status: str
    database_status: str
    ai_model_status: str
    storage_status: str
    total_storage_used: int
    active_connections: int

class RecentActivity(BaseModel):
    id: str
    type: str
    user_email: str
    user_name: str
    details: str
    timestamp: str

@router.get("/analytics", response_model=SystemAnalytics)
async def get_analytics(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get system-wide analytics with real data"""
    
    # Get date ranges
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Total users (exclude admins)
    total_users = db.query(User).filter(User.role != UserRole.ADMIN).count()
    
    # Active users (logged in within last 30 days, exclude admins)
    active_users = db.query(User).filter(
        User.last_login >= month_ago,
        User.role != UserRole.ADMIN
    ).count()
    
    # Upload statistics
    total_uploads = db.query(ImageProcessing).count()
    
    successful_uploads = db.query(ImageProcessing).filter(
        ImageProcessing.status == ProcessingStatus.COMPLETED.value
    ).count()
    
    failed_uploads = db.query(ImageProcessing).filter(
        ImageProcessing.status == ProcessingStatus.FAILED.value
    ).count()
    
    success_rate = (successful_uploads / total_uploads * 100) if total_uploads > 0 else 0.0
    
    # Time-based uploads
    daily_uploads = db.query(ImageProcessing).filter(
        ImageProcessing.created_at >= today
    ).count()
    
    weekly_uploads = db.query(ImageProcessing).filter(
        ImageProcessing.created_at >= week_ago
    ).count()
    
    monthly_uploads = db.query(ImageProcessing).filter(
        ImageProcessing.created_at >= month_ago
    ).count()
    
    # Average processing time
    avg_time_result = db.query(func.avg(ImageProcessing.processing_time)).filter(
        ImageProcessing.processing_time.isnot(None)
    ).scalar()
    average_processing_time = float(avg_time_result) if avg_time_result else 0.0
    
    # Processing queue (currently processing)
    processing_queue = db.query(ImageProcessing).filter(
        ImageProcessing.status == ProcessingStatus.PROCESSING.value
    ).count()
    
    # Error rate in last 24 hours
    yesterday = now - timedelta(days=1)
    uploads_24h = db.query(ImageProcessing).filter(
        ImageProcessing.created_at >= yesterday
    ).count()
    failed_24h = db.query(ImageProcessing).filter(
        ImageProcessing.created_at >= yesterday,
        ImageProcessing.status == ProcessingStatus.FAILED.value
    ).count()
    error_rate_24h = (failed_24h / uploads_24h * 100) if uploads_24h > 0 else 0.0
    
    # Storage usage in GB
    total_storage_bytes = db.query(func.sum(ImageProcessing.file_size)).scalar() or 0
    storage_usage_gb = total_storage_bytes / (1024 * 1024 * 1024)  # Convert to GB
    
    # Failed logins in last 24 hours (placeholder - would need login attempt tracking)
    failed_logins_24h = 0  # TODO: Implement login attempt tracking
    
    return SystemAnalytics(
        total_users=total_users,
        active_users=active_users,
        total_uploads=total_uploads,
        successful_uploads=successful_uploads,
        failed_uploads=failed_uploads,
        success_rate=round(success_rate, 1),
        daily_uploads=daily_uploads,
        weekly_uploads=weekly_uploads,
        monthly_uploads=monthly_uploads,
        average_processing_time=round(average_processing_time, 2),
        processing_queue=processing_queue,
        error_rate_24h=round(error_rate_24h, 1),
        storage_usage_gb=round(storage_usage_gb, 2),
        failed_logins_24h=failed_logins_24h
    )

@router.get("/users", response_model=List[UserInfo])
async def get_users(
    page: int = 1,
    limit: int = 20,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users with real data (paginated)"""
    
    # Get users with upload counts
    offset = (page - 1) * limit
    
    users = db.query(User).order_by(desc(User.created_at)).offset(offset).limit(limit).all()
    
    user_list = []
    for user in users:
        # Count uploads for each user
        upload_count = db.query(ImageProcessing).filter(
            ImageProcessing.user_id == user.id
        ).count()
        
        user_list.append(UserInfo(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role.value,
            status=user.status.value,
            email_verified=user.email_verified,
            created_at=user.created_at.isoformat(),
            last_login=user.last_login.isoformat() if user.last_login else None,
            total_uploads=upload_count
        ))
    
    return user_list

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a user and all their data"""
    
    # Find user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Don't allow deleting other admins
    if user.role == UserRole.ADMIN and user.id != current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete other admin users"
        )
    
    # Delete user's uploads first
    db.query(ImageProcessing).filter(ImageProcessing.user_id == user_id).delete()
    
    # Delete user
    db.delete(user)
    db.commit()
    
    return {"message": f"User {user.email} deleted successfully"}

@router.get("/uploads", response_model=List[UploadInfo])
async def get_uploads(
    page: int = 1,
    limit: int = 20,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all uploads across the platform with real data"""
    
    offset = (page - 1) * limit
    
    # Get uploads with user information
    uploads = db.query(ImageProcessing, User).join(
        User, ImageProcessing.user_id == User.id
    ).order_by(desc(ImageProcessing.created_at)).offset(offset).limit(limit).all()
    
    upload_list = []
    for upload, user in uploads:
        upload_list.append(UploadInfo(
            id=upload.id,
            user_id=upload.user_id,
            user_email=user.email,
            user_name=user.name,
            original_filename=upload.original_filename,
            status=upload.status,
            processing_time=upload.processing_time,
            file_size=upload.file_size,
            created_at=upload.created_at.isoformat()
        ))
    
    return upload_list

@router.delete("/uploads/{upload_id}")
async def delete_upload(
    upload_id: str,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a specific upload"""
    
    # Find upload
    upload = db.query(ImageProcessing).filter(ImageProcessing.id == upload_id).first()
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload not found"
        )
    
    # TODO: Delete files from Azure Blob Storage
    
    # Delete from database
    db.delete(upload)
    db.commit()
    
    return {"message": f"Upload {upload.original_filename} deleted successfully"}

@router.get("/system-health", response_model=SystemHealth)
async def get_system_health(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get system health status"""
    
    # Calculate total storage used (sum of all file sizes)
    total_storage = db.query(func.sum(ImageProcessing.file_size)).scalar() or 0
    
    # Count active database connections (simplified)
    active_connections = 1  # This would need actual database monitoring
    
    return SystemHealth(
        api_status="healthy",
        database_status="healthy",
        ai_model_status="healthy",
        storage_status="healthy" if total_storage < 10 * 1024 * 1024 * 1024 else "warning",  # 10GB limit
        total_storage_used=total_storage,
        active_connections=active_connections
    )

@router.get("/recent-activities", response_model=List[RecentActivity])
async def get_recent_activities(
    limit: int = 10,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get recent system activities"""
    
    activities = []
    
    # Recent uploads
    recent_uploads = db.query(ImageProcessing, User).join(
        User, ImageProcessing.user_id == User.id
    ).order_by(desc(ImageProcessing.created_at)).limit(limit // 2).all()
    
    for upload, user in recent_uploads:
        activities.append(RecentActivity(
            id=f"upload_{upload.id}",
            type="image_processed",
            user_email=user.email,
            user_name=user.name,
            details=f"Processed {upload.original_filename} - Status: {upload.status}",
            timestamp=upload.created_at.isoformat()
        ))
    
    # Recent user registrations
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(limit // 2).all()
    
    for user in recent_users:
        activities.append(RecentActivity(
            id=f"user_{user.id}",
            type="user_registered",
            user_email=user.email,
            user_name=user.name,
            details=f"New user registered",
            timestamp=user.created_at.isoformat()
        ))
    
    # Sort by timestamp (most recent first)
    activities.sort(key=lambda x: x.timestamp, reverse=True)
    
    return activities[:limit]

@router.get("/most-active-users", response_model=List[MostActiveUser])
async def get_most_active_users(
    limit: int = 5,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get most active users by upload count"""
    
    # Get users with their upload counts, excluding admins
    user_upload_counts = db.query(
        User.id,
        User.name,
        User.email,
        func.count(ImageProcessing.id).label('upload_count'),
        func.max(ImageProcessing.created_at).label('last_upload')
    ).outerjoin(
        ImageProcessing, User.id == ImageProcessing.user_id
    ).filter(
        User.role != UserRole.ADMIN
    ).group_by(
        User.id, User.name, User.email
    ).order_by(
        func.count(ImageProcessing.id).desc()
    ).limit(limit).all()
    
    active_users = []
    for user_id, name, email, upload_count, last_upload in user_upload_counts:
        active_users.append(MostActiveUser(
            user_id=user_id,
            user_name=name,
            user_email=email,
            upload_count=upload_count or 0,
            last_upload=last_upload.isoformat() if last_upload else "Never"
        ))
    
    return active_users

@router.get("/quick-actions", response_model=List[QuickAction])
async def get_quick_actions(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get quick action items for admin dashboard"""
    
    # Count pending items for quick actions
    pending_uploads = db.query(ImageProcessing).filter(
        ImageProcessing.status == ProcessingStatus.PROCESSING.value
    ).count()
    
    failed_uploads = db.query(ImageProcessing).filter(
        ImageProcessing.status == ProcessingStatus.FAILED.value
    ).count()
    
    inactive_users = db.query(User).filter(
        User.role != UserRole.ADMIN,
        User.last_login < datetime.utcnow() - timedelta(days=30)
    ).count()
    
    total_users = db.query(User).filter(User.role != UserRole.ADMIN).count()
    
    actions = [
        QuickAction(
            id="manage_users",
            title="Manage Users",
            description="View and manage user accounts",
            action_type="navigation",
            count=total_users
        ),
        QuickAction(
            id="failed_uploads",
            title="Failed Uploads",
            description="Review and retry failed uploads",
            action_type="alert",
            count=failed_uploads
        ),
        QuickAction(
            id="inactive_users",
            title="Inactive Users",
            description="Users not logged in for 30+ days",
            action_type="warning",
            count=inactive_users
        ),
        QuickAction(
            id="system_backup",
            title="System Backup",
            description="Create system backup",
            action_type="maintenance"
        ),
        QuickAction(
            id="export_data",
            title="Export Reports",
            description="Download system reports",
            action_type="export"
        )
    ]
    
    return actions