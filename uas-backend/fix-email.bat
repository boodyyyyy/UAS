@echo off
echo Fixing email cache directories...
cd /d "%~dp0"

if not exist "storage\framework" mkdir "storage\framework"
if not exist "storage\framework\cache" mkdir "storage\framework\cache"
if not exist "storage\framework\cache\data" mkdir "storage\framework\cache\data"
if not exist "storage\framework\sessions" mkdir "storage\framework\sessions"
if not exist "storage\framework\views" mkdir "storage\framework\views"

echo.
echo Cache directories created!
echo.
echo Now make sure your .env file has:
echo   CACHE_DRIVER=file
echo   MAIL_MAILER=smtp
echo   MAIL_HOST=smtp.mailtrap.io
echo   MAIL_PORT=2525
echo   MAIL_USERNAME=your-mailtrap-username
echo   MAIL_PASSWORD=your-mailtrap-password
echo   MAIL_ENCRYPTION=tls
echo   MAIL_FROM_ADDRESS=noreply@uas.edu
echo   MAIL_FROM_NAME="University Accounting System"
echo.
echo Then run: php artisan config:clear
echo.
pause

