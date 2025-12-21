# Angular Frontend Setup Guide

This guide will help you set up the Angular 21 frontend application for the University Accounting System (UAS).

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - Should show v18.x.x or higher

2. **npm** (v10 or higher - comes with Node.js)
   - Verify installation: `npm --version`
   - Should show v10.x.x or higher

3. **Angular CLI** (v21 or higher)
   - Will be installed automatically via `npm install`
   - Or install globally: `npm install -g @angular/cli@21`
   - Verify: `ng version`

### Optional but Recommended

- **Git** - For version control
- **VS Code** or your preferred IDE
- **Chrome/Edge** - For development and debugging

## Quick Setup

### Windows Users

If you're on Windows, you can use the automated setup script:

```bash
cd uas-frontend
setup.bat
```

### Linux/Mac Users

If you're on Linux or macOS, use the shell script:

```bash
cd uas-frontend
chmod +x setup.sh    # Make it executable (first time only)
./setup.sh           # Run the script
```

Both scripts will automatically:
- Check Node.js and npm installation
- Verify Node.js version (v18+)
- Install all dependencies
- Verify environment configuration
- Provide next steps

## Manual Setup Steps

### Step 1: Navigate to Project Directory

```bash
cd uas-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Angular 21 framework
- TypeScript
- RxJS
- Chart.js and ng2-charts
- ngx-cookie-service
- And other dependencies

**Expected time:** 2-5 minutes depending on internet speed

### Step 3: Configure Environment

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  
  // Update this if your backend runs on a different port
  apiUrl: 'http://localhost:8000/api',
  
  // Optional: Configure chatbot API keys if you want to use the AI chat feature
  openaiApiKey: 'YOUR_OPENAI_API_KEY_HERE',
  togetherApiKey: 'YOUR_TOGETHER_API_KEY_HERE',
  geminiApiKey: 'YOUR_GEMINI_API_KEY_HERE',
  chatApiProvider: 'gemini' as 'openai' | 'together' | 'gemini',
  
  // API endpoints (usually don't need to change)
  openaiApiUrl: 'https://api.openai.com/v1/chat/completions',
  togetherApiUrl: 'https://api.together.xyz/v1/chat/completions',
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
};
```

**Important:** 
- Make sure the `apiUrl` matches your Laravel backend URL
- Default backend runs on `http://localhost:8000`
- Chatbot keys are optional - the app works without them

### Step 4: Start Development Server

```bash
npm start
```

Or alternatively:

```bash
ng serve
```

The application will be available at: **http://localhost:4200**

The server will automatically reload when you make changes to the code.

## Verification

After starting the server, you should see:

```
✔ Browser application bundle generation complete.
Initial chunk files   | Names         |  Size
main.js               | main          |  XXX kB
polyfills.js          | polyfills     |  XXX kB

** Angular Live Development Server is listening on localhost:4200 **
```

Open your browser and navigate to `http://localhost:4200`. You should see the login page.

## Troubleshooting

### Issue: Node.js version is too old

**Error:** `The engine "node" is incompatible with this module`

**Solution:**
- Update Node.js to v18 or higher
- Download from: https://nodejs.org/
- Or use nvm (Node Version Manager) to manage multiple versions

### Issue: npm install fails

**Possible causes:**
- Internet connection issues
- Firewall blocking npm
- Corrupted npm cache

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json, then reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 4200 is already in use

**Error:** `Port 4200 is already in use`

**Solution:**
```bash
# Use a different port
ng serve --port 4201

# Or kill the process using port 4200
# Windows:
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### Issue: Cannot connect to backend API

**Error:** `Http failure response` or CORS errors

**Solutions:**
1. Make sure the Laravel backend is running on `http://localhost:8000`
2. Verify the `apiUrl` in `environment.ts` matches your backend URL
3. Check backend CORS configuration in `config/cors.php`
4. Ensure backend has `SANCTUM_STATEFUL_DOMAINS` configured for `localhost:4200`

### Issue: Angular CLI not found

**Error:** `'ng' is not recognized as an internal or external command`

**Solution:**
```bash
# Install Angular CLI globally
npm install -g @angular/cli@21

# Or use npx (no global installation needed)
npx ng serve
```

### Issue: TypeScript compilation errors

**Error:** Various TypeScript errors

**Solutions:**
1. Make sure you're using TypeScript 5.9.x (comes with the project)
2. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Check for syntax errors in your code

## Production Build

To build the application for production:

```bash
npm run build
```

The production build will be in the `dist/` directory.

For production deployment, you may need to:
1. Update `src/environments/environment.prod.ts` with production API URL
2. Configure your web server (nginx, Apache, etc.)
3. Set up proper CORS and security headers

## Project Structure

```
uas-frontend/
├── src/
│   ├── app/
│   │   ├── components/      # Page components
│   │   ├── layouts/         # Layout components
│   │   ├── services/        # Business logic services
│   │   ├── models/          # TypeScript interfaces
│   │   ├── guards/          # Route guards
│   │   └── shared/          # Shared components
│   ├── environments/        # Environment configuration
│   └── styles.scss          # Global styles
├── angular.json             # Angular configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes
- `npm test` - Run unit tests

## Default Login Credentials

After setting up the backend with demo data:

- **Admin**: `admin@uas.edu` / `password`
- **Accountant**: `accountant@uas.edu` / `password`
- **Student**: `student@uas.edu` / `password`

## Next Steps

1. ✅ Complete frontend setup (you are here)
2. ✅ Complete backend setup (run `setup.bat` in `uas-backend` folder)
3. Start both servers:
   - Backend: `cd uas-backend && php artisan serve`
   - Frontend: `cd uas-frontend && npm start`
4. Open `http://localhost:4200` in your browser
5. Login with demo credentials

## Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular CLI Documentation](https://angular.io/cli)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

## Support

If you encounter any issues not covered in this guide:
1. Check the browser console for errors
2. Check the terminal output for compilation errors
3. Verify all prerequisites are installed correctly
4. Ensure the backend is running and accessible

---

**Last Updated:** December 2024  
**Angular Version:** 21.0.5  
**Node.js Requirement:** v18 or higher

