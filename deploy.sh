#!/bin/bash

# Orion Project Management System - Deployment Script
# This script builds and prepares the application for deployment

echo "🚀 Orion Project Management System - Deployment Script"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the project
echo "🔨 Building project for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ dist folder not found after build"
    exit 1
fi

echo "📁 Production files are ready in the 'dist' folder"
echo ""
echo "🌐 Deployment Options:"
echo "====================="
echo ""
echo "1. Netlify:"
echo "   - Go to https://app.netlify.com"
echo "   - Drag and drop the 'dist' folder"
echo "   - Your site will be live instantly!"
echo ""
echo "2. Vercel:"
echo "   - Install Vercel CLI: npm i -g vercel"
echo "   - Run: vercel --prod"
echo ""
echo "3. GitHub Pages:"
echo "   - Push to GitHub"
echo "   - Enable GitHub Pages in repository settings"
echo "   - Set source to 'dist' folder"
echo ""
echo "4. Firebase Hosting:"
echo "   - Install Firebase CLI: npm i -g firebase-tools"
echo "   - Run: firebase init hosting"
echo "   - Set public directory to 'dist'"
echo "   - Run: firebase deploy"
echo ""
echo "5. Any Static Hosting:"
echo "   - Upload contents of 'dist' folder to your hosting service"
echo ""
echo "🎉 Your Orion Project Management System is ready for deployment!"
echo ""
echo "💡 Demo Mode is enabled by default - no backend setup required!"
echo "   Users can explore all features immediately." 