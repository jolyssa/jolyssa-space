// Cloudflare Pages Function for GitHub OAuth
// IMPORTANT: This file must be exactly in /functions/auth.js for Cloudflare Pages

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Debug logging
  console.log('[AUTH] Function called');
  console.log('[AUTH] Code present:', !!code);
  console.log('[AUTH] Environment check:', !!context.env.GITHUB_CLIENT_ID);

  // Check environment variables
  if (!context.env.GITHUB_CLIENT_ID || !context.env.GITHUB_CLIENT_SECRET) {
    console.error('[AUTH] Missing environment variables');
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/?error=missing_env_vars' },
    });
  }

  // Handle OAuth errors from GitHub
  if (error) {
    console.error('[AUTH] OAuth error from GitHub:', error);
    return new Response(null, {
      status: 302,
      headers: { 'Location': `/?error=${error}` },
    });
  }

  // Handle OAuth callback (when GitHub sends back the authorization code)
  if (code) {
    console.log('[AUTH] Processing OAuth callback');
    
    try {
      // Step 1: Exchange authorization code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: context.env.GITHUB_CLIENT_ID,
          client_secret: context.env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        throw new Error(`GitHub error: ${tokenData.error}`);
      }

      if (!tokenData.access_token) {
        throw new Error('No access token received');
      }

      console.log('[AUTH] Token received, verifying user');

      // Step 2: Get user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (!userResponse.ok) {
        throw new Error(`User fetch failed: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      console.log('[AUTH] User verified:', userData.login);

      // Step 3: Check authorization
      const AUTHORIZED_USERS = ['jolyssa', 'JojoW']; // UPDATE THIS WITH YOUR GITHUB USERNAME
      
      if (!AUTHORIZED_USERS.includes(userData.login)) {
        console.error('[AUTH] Unauthorized user:', userData.login);
        return new Response(null, {
          status: 302,
          headers: { 'Location': '/?error=unauthorized' },
        });
      }

      console.log('[AUTH] User authorized, redirecting to admin');

      // Step 4: Create session and redirect
      return new Response(`
<!DOCTYPE html>
<html>
<head>
  <title>Login Successful</title>
  <style>
    body {
      background: #2D2D2D;
      color: #E5E5E5;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 4rem;
    }
  </style>
</head>
<body>
  <h1>✅ Login Successful!</h1>
  <p>Redirecting to admin dashboard...</p>
  <script>
    console.log('[AUTH] Setting token and redirecting');
    localStorage.setItem('github_token', '${tokenData.access_token}');
    localStorage.removeItem('oauth_state');
    setTimeout(() => {
      window.location.replace('/admin');
    }, 1000);
  </script>
</body>
</html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });

    } catch (error) {
      console.error('[AUTH] OAuth callback error:', error);
      return new Response(null, {
        status: 302,
        headers: { 'Location': `/?error=callback_failed` },
      });
    }
  } // End of if (code) block

  // No code parameter - redirect to GitHub OAuth
  console.log('[AUTH] Initiating OAuth flow');
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', context.env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', `${url.origin}/functions/auth`);
  githubAuthUrl.searchParams.set('scope', 'repo,user');
  githubAuthUrl.searchParams.set('state', state || 'admin');
  
  return new Response(null, {
    status: 302,
    headers: { 'Location': githubAuthUrl.toString() },
  });
}

// Also handle POST requests (some OAuth flows might use POST)
export async function onRequestPost(context) {
  return onRequestGet(context);
}
