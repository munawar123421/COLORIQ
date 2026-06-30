import os
from dotenv import load_dotenv
from typing import List
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

load_dotenv()

# Email configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@coloriq.com")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# Admin emails list
ADMIN_EMAILS = os.getenv("ADMIN_EMAILS", "admin@coloriq.com").split(",")

def send_email_sendgrid(to_email: str, subject: str, html_content: str):
    """Send email using SendGrid"""
    try:
        # Import only when needed
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ Email sent to {to_email}: {response.status_code}")
        return True
    except ImportError:
        print(f"⚠️ SendGrid not installed. Install with: pip install sendgrid")
        return False
    except Exception as e:
        print(f"❌ Error sending email to {to_email}: {str(e)}")
        return False

def send_email_smtp(to_email: str, subject: str, html_content: str):
    """Send email using SMTP (Gmail, Outlook, etc.)"""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Error sending email to {to_email}: {str(e)}")
        return False

def send_email(to_email: str, subject: str, html_content: str):
    """Send email using available service"""
    if SENDGRID_API_KEY:
        return send_email_sendgrid(to_email, subject, html_content)
    elif SMTP_USERNAME and SMTP_PASSWORD:
        return send_email_smtp(to_email, subject, html_content)
    else:
        print(f"⚠️ Email service not configured. Would send to {to_email}: {subject}")
        return False

def send_welcome_email(user_email: str, user_name: str):
    """Send welcome email to new user"""
    subject = "Welcome to COLORIQ!"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #3B82F6;">Welcome to COLORIQ! 🎨</h2>
                <p>Hello {user_name},</p>
                <p>Thank you for registering with COLORIQ - your AI-powered color correction platform!</p>
                <p>You can now:</p>
                <ul>
                    <li>Upload clothing images for color analysis</li>
                    <li>Get AI-corrected realistic color previews</li>
                    <li>Track your analysis history</li>
                    <li>View personal analytics</li>
                </ul>
                <p>Get started by logging in to your dashboard:</p>
                <a href="http://localhost:3000/dashboard" 
                   style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; 
                          color: white; text-decoration: none; border-radius: 8px; margin: 10px 0;">
                    Go to Dashboard
                </a>
                <p style="margin-top: 20px; color: #666; font-size: 14px;">
                    Best regards,<br>
                    The COLORIQ Team
                </p>
            </div>
        </body>
    </html>
    """
    return send_email(user_email, subject, html_content)

def send_admin_notification(user_email: str, user_name: str, user_id: str):
    """Send notification to all admins when new user registers"""
    subject = "New User Registration - COLORIQ"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #F59E0B;">New User Registration 👤</h2>
                <p>Hello Admin,</p>
                <p>A new user has registered on the COLORIQ platform:</p>
                <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Name:</strong> {user_name}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> {user_email}</p>
                    <p style="margin: 5px 0;"><strong>User ID:</strong> {user_id}</p>
                    <p style="margin: 5px 0;"><strong>Registration Date:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
                <p>You can view and manage this user in the Admin Panel:</p>
                <a href="http://localhost:3000/admin/users" 
                   style="display: inline-block; padding: 12px 24px; background-color: #F59E0B; 
                          color: white; text-decoration: none; border-radius: 8px; margin: 10px 0;">
                    View in Admin Panel
                </a>
                <p style="margin-top: 20px; color: #666; font-size: 14px;">
                    This is an automated notification from COLORIQ System.
                </p>
            </div>
        </body>
    </html>
    """
    
    # Send to all admin emails
    for admin_email in ADMIN_EMAILS:
        send_email(admin_email.strip(), subject, html_content)
