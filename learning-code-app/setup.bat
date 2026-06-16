@echo off
REM Learning Code App - Development Setup Script for Windows

echo.
echo 🚀 Learning Code App - Setup Script
echo ====================================
echo.

REM Check Node.js
echo ✓ Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Node.js not found. Please install Node.js 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo   Node version: %%i
echo.

REM Check npm
echo ✓ Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ npm not found. Please install npm
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do echo   npm version: %%i
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Failed to install dependencies
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env >nul
    echo ✓ .env file created. Please edit it with your Firebase credentials
) else (
    echo ✓ .env file already exists
)
echo.

REM Check Expo CLI
echo ✓ Checking Expo CLI...
where expo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   Installing Expo CLI...
    call npm install -g expo-cli
)
echo ✓ Expo CLI ready
echo.

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env with your Firebase credentials
echo 2. Run: npm start
echo 3. Scan the QR code with Expo Go app
echo.
pause
