from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#from fastapi.staticfiles import StaticFiles
import uvicorn

# Import routes
from app.routes import auth, user, admin, analysis, images

# Import database initialization
from app.database import init_db

# Create FastAPI instance
app = FastAPI(
    title="COLORIQ API",
    description="AI-Based Color Correction System for E-commerce Clothing",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("🚀 COLORIQ API started successfully!")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(images.router, prefix="/api/images", tags=["Image Processing"])

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "COLORIQ API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "COLORIQ API"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )