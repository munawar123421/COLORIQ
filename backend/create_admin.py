"""
Script to create admin user in the database
Run this once to create your admin account
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, init_db
from app.models.user import User, UserRole, UserStatus
from app.utils.password import hash_password
from datetime import datetime
import uuid

def create_admin():
    """Create admin user"""
    
    # Initialize database
    init_db()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@coloriq.com").first()
        
        if existing_admin:
            print("⚠️  Admin user already exists!")
            print(f"Email: {existing_admin.email}")
            print(f"Name: {existing_admin.name}")
            return
        
        # Create admin user
        admin_user = User(
            id=str(uuid.uuid4()),
            email="admin@coloriq.com",
            password_hash=hash_password("admin123"),
            name="System Administrator",
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            email_verified=True,
            created_at=datetime.utcnow()
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"\nAdmin Credentials:")
        print(f"Email: admin@coloriq.com")
        print(f"Password: admin123")
        print(f"\n⚠️  IMPORTANT: Change the password after first login!")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
