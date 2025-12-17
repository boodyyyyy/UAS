@echo off
echo ========================================
echo Setting up Angular Frontend for UAS...
echo ========================================
echo.

echo Step 1: Checking Node.js installation...
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js v18 or higher from https://nodejs.org/
    pause
    exit /b 1
)

node --version
echo Node.js found!
echo.

echo Step 2: Checking npm installation...
where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH.
    pause
    exit /b 1
)

npm --version
echo npm found!
echo.

echo Step 3: Checking Node.js version (requires v18+)...
for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
echo Current Node.js version: %NODE_VERSION%
echo.

echo Step 4: Installing npm dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed. Please check your internet connection and try again.
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

echo Step 5: Checking Angular CLI...
call npx ng version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Angular CLI not found. It will be installed via npx when needed.
) else (
    echo Angular CLI is available.
)
echo.

echo Step 6: Verifying environment configuration...
if exist "src\environments\environment.ts" (
    echo Environment file found.
    echo NOTE: Make sure to configure your API URL in src\environments\environment.ts
    echo       Default API URL: http://localhost:8000/api
    echo       If your backend runs on a different port, update the apiUrl.
) else (
    echo WARNING: Environment file not found!
)
echo.

echo ========================================
echo Setup completed successfully!
echo.
echo Next steps:
echo 1. Make sure the Laravel backend is running on http://localhost:8000
echo 2. Update src\environments\environment.ts if needed (API URL, chatbot keys)
echo 3. Run 'npm start' to start the development server
echo 4. Open http://localhost:4200 in your browser
echo.
echo Default Demo Accounts (from backend):
echo - Admin: admin@uas.edu / password
echo - Accountant: accountant@uas.edu / password
echo - Student: student@uas.edu / password
echo ========================================
pause

