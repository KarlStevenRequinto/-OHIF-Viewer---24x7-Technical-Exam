# 🚀 Deployment Guide - OHIF Dental Viewer on Netlify

This guide will walk you through deploying the OHIF Dental Viewer (frontend) to Netlify and the backend API to a hosting service.

---

## 📋 Prerequisites

- GitHub account
- Netlify account (free tier works)
- Backend hosting (Heroku, Railway, Render, or similar)
- Git installed on your machine

---

## Part 1: Deploy Backend API

### Option A: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create a new Heroku app**
   ```bash
   cd backend
   heroku create your-dental-api
   ```

4. **Add a Procfile** (create `backend/Procfile`):
   ```
   web: node src/server.js
   ```

5. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-super-secret-key-change-this
   heroku config:set PORT=5000
   ```

6. **Deploy to Heroku**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push heroku main
   ```

7. **Note your API URL**: `https://your-dental-api.herokuapp.com`

### Option B: Deploy to Railway.app

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-super-secret-key`
   - `PORT=5000`
6. Deploy and note your API URL

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Prepare Your Repository

1. **Make sure all changes are committed**
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Update API URL in netlify.toml**

   Open `netlify.toml` and update line 17:
   ```toml
   VITE_API_URL = "https://your-actual-backend-api.herokuapp.com/api"
   ```

   Replace with your actual backend URL from Step 1.

3. **Commit the change**
   ```bash
   git add netlify.toml
   git commit -m "Update API URL for production"
   git push origin main
   ```

---

### Step 2: Deploy to Netlify (Option A: GitHub Integration)

1. **Login to Netlify**
   - Go to https://app.netlify.com
   - Sign up or login (use GitHub for easier integration)

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub account
   - Select your OHIF Viewer repository

3. **Configure Build Settings**
   - **Branch to deploy**: `main` (or your branch name)
   - **Base directory**: Leave blank
   - **Build command**: `yarn build`
   - **Publish directory**: `platform/app/dist`

4. **Add Environment Variables** (if not using netlify.toml)
   - Click "Show advanced" → "New variable"
   - Add:
     - `NODE_VERSION` = `18`
     - `VITE_API_URL` = `https://your-backend-api.herokuapp.com/api`

5. **Deploy Site**
   - Click "Deploy site"
   - Wait 5-10 minutes for build to complete
   - Your site will be live at `https://random-name.netlify.app`

---

### Step 3: Custom Domain (Optional)

1. In Netlify dashboard → "Domain settings"
2. Click "Add custom domain"
3. Follow instructions to add your domain
4. Enable HTTPS (automatic)

---

## Step 4: Configure CORS on Backend

Update your backend to allow requests from Netlify:

**`backend/src/server.js`** - Update CORS:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-site.netlify.app',  // Add your Netlify URL
    'https://your-custom-domain.com'  // Add custom domain if you have one
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

Redeploy backend after this change.

---

## Step 5: Test Deployment

1. **Open your Netlify URL**: `https://your-site.netlify.app`

2. **Test functionality**:
   - ✅ Homepage loads
   - ✅ Click "Dental" mode button
   - ✅ Images display in 2x2 grid
   - ✅ Dental header shows
   - ✅ Measurement tools work
   - ✅ Click "Login/Register" (test authentication)
   - ✅ Create measurements
   - ✅ Export JSON works

3. **Check browser console** for errors

---

## Troubleshooting

### Build Fails on Netlify

**Error: "Out of memory"**
- Solution: Increase Node memory in build command
  ```toml
  command = "NODE_OPTIONS='--max-old-space-size=4096' yarn build"
  ```

**Error: "Module not found"**
- Solution: Clear cache and rebuild
  - Netlify dashboard → "Deploys" → "Trigger deploy" → "Clear cache and deploy site"

### Backend Connection Issues

**Error: "Network Error" or "CORS error"**
- Check CORS configuration on backend
- Verify `VITE_API_URL` is correct in Netlify environment variables
- Check backend logs for errors

**Database not persisting**
- If using SQLite, data will reset on Heroku/Railway restarts
- Consider upgrading to PostgreSQL for production:
  - Add PostgreSQL addon on Heroku
  - Update database config to use PostgreSQL

### Images Not Loading

**Orthanc/DICOM Server Issues**
- The demo uses a local Orthanc server
- For production, you need a hosted DICOM server
- Update `platform/app/public/config/default.js` to point to your DICOM server

---

## Environment Variables Reference

### Frontend (Netlify)
| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_VERSION` | `18` | Node.js version |
| `VITE_API_URL` | `https://your-api.com/api` | Backend API URL |
| `NODE_ENV` | `production` | Environment |

### Backend (Heroku/Railway)
| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment |
| `JWT_SECRET` | `random-secret-key` | JWT signing key |
| `PORT` | `5000` | Server port |

---

## 🎉 Deployment Complete!

Your OHIF Dental Viewer is now live at:
- **Frontend**: `https://your-site.netlify.app`
- **Backend**: `https://your-api.herokuapp.com`

### Next Steps:
1. Set up custom domain
2. Configure SSL/HTTPS
3. Set up monitoring (e.g., Sentry)
4. Configure backups for database
5. Add analytics (optional)

---

## Useful Commands

```bash
# Redeploy to Netlify (push to GitHub)
git push origin main

# View Netlify build logs
netlify deploy --prod

# View backend logs (Heroku)
heroku logs --tail --app your-dental-api

# View backend logs (Railway)
railway logs
```

---

## Support

If you encounter issues:
1. Check Netlify build logs
2. Check backend logs
3. Check browser console for errors
4. Verify environment variables
5. Test API endpoints directly with Postman/curl

---

## Security Notes

⚠️ **Important**:
- Change `JWT_SECRET` to a strong random string
- Don't commit `.env` files to Git
- Use HTTPS for production
- Implement rate limiting on API
- Regularly update dependencies
- Monitor for security vulnerabilities

---

**Last Updated**: December 2024
