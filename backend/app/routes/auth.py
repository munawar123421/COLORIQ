from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
import os
from dotenv import load_dotenv

from app.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token, verify_token
from app.services.email_service import send_welcome_email, send_admin_notification, ADMIN_EMAILS

load_dotenv()

router = APIRouter()
security = HTTPBearer()

# Pydantic models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    status: str
    email_verified: bool
    created_at: str

# Dependency to get current user from token
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user from JWT token"""
    payload = verify_token(credentials.credentials)
    user_id = payload.get("user_id")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

# Dependency to require admin role
def require_admin(current_user: User = Depends(get_current_user)):
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.post("/register", response_model=dict)
async def register(
    user_data: UserRegister,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Determine role based on email
    role = UserRole.ADMIN if user_data.email in ADMIN_EMAILS else UserRole.USER
    
    # Create new user
    new_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        name=user_data.name,
        role=role,
        status=UserStatus.ACTIVE,
        email_verified=True,  # Auto-verify for simplicity (can add OTP later)
        created_at=datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send welcome email to user (in background)
    background_tasks.add_task(send_welcome_email, new_user.email, new_user.name)
    
    # Send notification to admins (in background)
    if role == UserRole.USER:  # Don't notify when admin registers
        background_tasks.add_task(
            send_admin_notification,
            new_user.email,
            new_user.name,
            new_user.id
        )
    
    return {
        "message": "Registration successful! You can now login.",
        "user": new_user.to_dict()
    }

@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Authenticate user and return JWT token"""
    
    # Find user by email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if account is active
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {user.status.value}. Please contact support."
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value,
            "name": user.name
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role.value,
        status=current_user.status.value,
        email_verified=current_user.email_verified,
        created_at=current_user.created_at.isoformat()
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh JWT token"""
    
    # Create new access token
    access_token = create_access_token(
        data={
            "user_id": current_user.id,
            "email": current_user.email,
            "role": current_user.role.value,
            "name": current_user.name
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": current_user.to_dict()
    }

@router.post("/logout")
async def logout():
    """Logout user (client should delete token)"""
    return {"message": "Logged out successfully"}

# For backward compatibility with existing code
users_db = {}

def verify_token_legacy(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Legacy token verification for existing routes"""
    payload = verify_token(credentials.credentials)
    return payload.get("email")