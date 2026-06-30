"""
Verify Admin User in Database
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

print("\n" + "="*60)
print("  Admin User Verification")
print("="*60 + "\n")

DATABASE_URL = os.getenv("DATABASE_URL")

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Get all users
        result = conn.execute(text("""
            SELECT 
                id,
                email, 
                name, 
                role::text as role,
                status::text as status,
                email_verified,
                created_at,
                last_login
            FROM users 
            ORDER BY created_at;
        """))
        
        users = result.fetchall()
        
        if not users:
            print("❌ No users found in database!")
            print("\nRun this to create admin:")
            print("   python quick_start.py")
        else:
            print(f"✅ Found {len(users)} user(s) in database:\n")
            
            for i, user in enumerate(users, 1):
                print(f"User #{i}:")
                print(f"  ID: {user[0]}")
                print(f"  Email: {user[1]}")
                print(f"  Name: {user[2]}")
                print(f"  Role: {user[3]} {'👑 (ADMIN)' if user[3] == 'ADMIN' else '👤 (USER)'}")
                print(f"  Status: {user[4]}")
                print(f"  Email Verified: {'✅' if user[5] else '❌'}")
                print(f"  Created: {user[6]}")
                print(f"  Last Login: {user[7] if user[7] else 'Never'}")
                print()
            
            # Check for admin
            admin_count = sum(1 for user in users if user[3] == 'ADMIN')
            user_count = sum(1 for user in users if user[3] == 'USER')
            
            print("="*60)
            print(f"Summary:")
            print(f"  Total Users: {len(users)}")
            print(f"  Admins: {admin_count} 👑")
            print(f"  Regular Users: {user_count} 👤")
            print("="*60)
            
            if admin_count > 0:
                print("\n✅ Admin user(s) found in database!")
                print("\nAdmin Credentials:")
                for user in users:
                    if user[3] == 'ADMIN':
                        print(f"  Email: {user[1]}")
                        print(f"  Password: admin123 (default)")
            else:
                print("\n⚠️  No admin users found!")
                print("\nRun this to create admin:")
                print("   python create_admin.py")
        
        print("\n" + "="*60 + "\n")
        
except Exception as e:
    print(f"❌ Error: {str(e)}\n")
