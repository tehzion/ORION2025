@echo off
echo 🚀 Orion Project Management System - Deployment Script
echo ==================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM Build the project
echo 🔨 Building project for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully
echo.

REM Check if dist folder exists
if not exist "dist" (
    echo ❌ dist folder not found after build
    pause
    exit /b 1
)

echo 📁 Production files are ready in the 'dist' folder
echo.
echo 🌐 Deployment Options:
echo =====================
echo.
echo 1. Netlify:
echo    - Go to https://app.netlify.com
echo    - Drag and drop the 'dist' folder
echo    - Your site will be live instantly!
echo.
echo 2. Vercel:
echo    - Install Vercel CLI: npm i -g vercel
echo    - Run: vercel --prod
echo.
echo 3. GitHub Pages:
echo    - Push to GitHub
echo    - Enable GitHub Pages in repository settings
echo    - Set source to 'dist' folder
echo.
echo 4. Firebase Hosting:
echo    - Install Firebase CLI: npm i -g firebase-tools
echo    - Run: firebase init hosting
echo    - Set public directory to 'dist'
echo    - Run: firebase deploy
echo.
echo 5. Any Static Hosting:
echo    - Upload contents of 'dist' folder to your hosting service
echo.
echo 🎉 Your Orion Project Management System is ready for deployment!
echo.
echo 💡 Demo Mode is enabled by default - no backend setup required!
echo    Users can explore all features immediately.
echo.
pause 