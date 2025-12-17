#!/bin/bash

echo "========================================"
echo "Setting up Angular Frontend for UAS..."
echo "========================================"
echo ""

# Step 1: Check Node.js installation
echo "Step 1: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH."
    echo "Please install Node.js v18 or higher from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "Node.js found: $NODE_VERSION"
echo ""

# Step 2: Check npm installation
echo "Step 2: Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH."
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "npm found: $NPM_VERSION"
echo ""

# Step 3: Check Node.js version
echo "Step 3: Checking Node.js version (requires v18+)..."
NODE_MAJOR_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
    echo "WARNING: Node.js version is less than v18. Some features may not work."
    echo "Current version: $NODE_VERSION"
    echo "Recommended: v18 or higher"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# Step 4: Install dependencies
echo "Step 4: Installing npm dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed. Please check your internet connection and try again."
    exit 1
fi
echo "Dependencies installed successfully!"
echo ""

# Step 5: Check Angular CLI
echo "Step 5: Checking Angular CLI..."
if ! command -v ng &> /dev/null; then
    echo "INFO: Angular CLI not found globally. It will be used via npx when needed."
else
    echo "Angular CLI is available."
fi
echo ""

# Step 6: Verify environment configuration
echo "Step 6: Verifying environment configuration..."
if [ -f "src/environments/environment.ts" ]; then
    echo "Environment file found."
    echo "NOTE: Make sure to configure your API URL in src/environments/environment.ts"
    echo "      Default API URL: http://localhost:8000/api"
    echo "      If your backend runs on a different port, update the apiUrl."
else
    echo "WARNING: Environment file not found!"
fi
echo ""

echo "========================================"
echo "Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Make sure the Laravel backend is running on http://localhost:8000"
echo "2. Update src/environments/environment.ts if needed (API URL, chatbot keys)"
echo "3. Run 'npm start' to start the development server"
echo "4. Open http://localhost:4200 in your browser"
echo ""
echo "Default Demo Accounts (from backend):"
echo "- Admin: admin@uas.edu / password"
echo "- Accountant: accountant@uas.edu / password"
echo "- Student: student@uas.edu / password"
echo "========================================"

