@echo off
REM MediaSoup Video Conferencing Service Documentation Server
REM This script starts the Docsify documentation server

echo 🚀 Starting MediaSoup Video Conferencing Service Documentation
echo ==============================================================

REM Check if docsify-cli is installed
docsify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing docsify-cli...
    npm install -g docsify-cli
)

REM Check if docs directory exists
if not exist "docs" (
    echo ❌ Error: docs directory not found!
    echo Please make sure you're in the project root directory.
    pause
    exit /b 1
)

REM Check if docsify is installed
docsify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: docsify-cli installation failed!
    echo Please install it manually: npm install -g docsify-cli
    pause
    exit /b 1
)

echo ✅ docsify-cli is installed
echo 📖 Starting documentation server...
echo.
echo 🌐 Documentation will be available at: http://localhost:3000
echo 📱 You can also access it on your local network
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start docsify server
docsify serve docs 3000 