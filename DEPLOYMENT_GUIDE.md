# Cloudflare Pages Deployment Guide

## Quick Deploy Steps

### 1. Go to Cloudflare Pages
- Visit https://dash.cloudflare.com/
- Sign in/create account
- Click "Pages" in sidebar
- Click "Create a project"

### 2. Connect GitHub
- Click "Connect to Git"
- Authorize Cloudflare to access GitHub
- Select your `jolyssa/jolyssa-space` repository

### 3. Configure Build
```
Project name: jolyssa-space
Production branch: main
Build command: bun run build
Build output directory: dist
```

### 4. Environment Variables (CRITICAL!)
After deployment, go to:
- Pages dashboard → Your site → Settings → Environment variables
- Add these (from your GitHub OAuth app):

```
GITHUB_CLIENT_ID = your_client_id_from_github
GITHUB_CLIENT_SECRET = your_client_secret_from_github
```

### 5. Deploy!
- Click "Save and Deploy"
- Wait 2-3 minutes for build
- Your site will be live at `https://jolyssa-space.pages.dev`

## After Deployment

1. **Update OAuth Callback**: If your domain is different, update the GitHub OAuth app callback URL
2. **Test CMS**: Visit `your-site.pages.dev/admin` 
3. **Login**: Click login → GitHub → Success!
4. **Create first post**: Test all collections work

## Custom Domain (Optional)
- Pages → Your site → Custom domains
- Add your domain and follow DNS instructions

## Troubleshooting
- **Build fails**: Check build logs, likely missing dependencies
- **OAuth fails**: Check environment variables are set correctly  
- **CMS won't load**: Check /functions/auth endpoint works

Your site will auto-deploy on every git push!