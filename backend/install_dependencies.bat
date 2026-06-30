@echo off
echo ============================================================
echo COLORIQ Backend - Installing All Dependencies
echo ============================================================
echo.

echo Step 1: Upgrading pip...
python -m pip install --upgrade pip
echo.

echo Step 2: Installing all dependencies from requirements.txt...
pip install -r requirements.txt
echo.

echo ============================================================
echo Installation Complete!
echo ============================================================
echo.
echo Next steps:
echo 1. Configure your .env file with database and Azure credentials
echo 2. Run: python -c "from app.database import init_db; init_db()"
echo 3. Start server: uvicorn app.main:app --reload --port 8000
echo.
pause
