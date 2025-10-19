# GitHub OAuth Setup for CMS

Since Netlify Identity is deprecated, we're using direct GitHub OAuth. Here's how to set it up:

## Step 1: Create GitHub OAuth App

1. **Go to GitHub Settings**:
   - Visit https://github.com/settings/developers
   - Click "OAuth Apps" → "New OAuth App"

2. **Fill in the details**:
   - **Application name**: `Jolyssa Space CMS`
   - **Homepage URL**: `https://your-domain.com` (your actual deployed site URL)
   - **Authorization callback URL**: `https://your-domain.com/functions/auth`

3. **After creating**:
   - Copy the **Client ID**
   - Generate and copy the **Client Secret**

## Step 2: Configure Environment Variables

### For Cloudflare Pages:

1. Go to your Cloudflare Pages dashboard
2. Select your site → Settings → Environment variables
3. Add these variables:
   - `GITHUB_CLIENT_ID` = your Client ID
   - `GITHUB_CLIENT_SECRET` = your Client Secret

### For local development:

Create a `.env` file in your project root:

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

## Step 3: Deploy and Test

1. **Deploy to Cloudflare Pages** with the environment variables
2. **Visit `your-domain.com/admin`**
3. **Click Login** → redirects to GitHub → authorize → redirects back
4. **Start creating content!**

## Security Notes

- Keep your Client Secret private (never commit to git)
- The OAuth app is restricted to your repository only
- Users need to be collaborators on your GitHub repo to access the CMS

## Troubleshooting

**"OAuth app not found"**: Check your Client ID is correct
**"Redirect URI mismatch"**: Ensure callback URL matches exactly
**"Not authorized"**: Make sure you're a collaborator on the GitHub repo

This setup avoids deprecated services and gives you full control over authentication!