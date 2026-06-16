#!/bin/bash

# Learning Code App - Development Setup Script
# This script helps set up the project for development

echo "🚀 Learning Code App - Setup Script"
echo "===================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "  Node version: $(node --version)"
echo ""

# Check npm
echo "✓ Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "✗ npm not found. Please install npm"
    exit 1
fi
echo "  npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "✗ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created. Please edit it with your Firebase credentials"
else
    echo "✓ .env file already exists"
fi
echo ""

# Check Expo CLI
echo "✓ Checking Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo "  Installing Expo CLI..."
    npm install -g expo-cli
fi
echo "  Expo CLI installed"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Firebase credentials"
echo "2. Run: npm start"
echo "3. Scan the QR code with Expo Go app"
echo ""
