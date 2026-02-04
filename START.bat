@echo off
echo.
echo ========================================
echo Folder Analysis Dashboard
echo ========================================
echo.
echo Installing backend dependencies...
echo.

cd /d "%~dp0backend"

if not exist node_modules (
    call npm install
) else (
    echo Dependencies already installed.
)

echo.
echo ========================================
echo Starting server...
echo ========================================
echo.
echo Access the application at: http://localhost:5000
echo Login with: demo / demo123
echo.

npm start
