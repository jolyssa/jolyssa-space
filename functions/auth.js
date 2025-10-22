// Cloudflare Pages Function for GitHub OAuth
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Check environment variables
  if (!context.env.GITHUB_CLIENT_ID || !context.env.GITHUB_CLIENT_SECRET) {
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/?error=missing_env_vars' },
    });
  }

  // Handle OAuth errors from GitHub
  if (error) {
    return new Response(null, {
      status: 302,
      headers: { 'Location': `/?error=${error}` },
    });
  }

  // Verify authorization code exists
  if (!code) {
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/?error=no_code' },
    });
  }

  try {
    // Exchange authorization code for access token
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
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/?error=token_request_failed' },
      });
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': `/?error=${tokenData.error}` },
      });
    }

    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/?error=no_access_token' },
      });
    }

    // Fetch user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'jolyssa-space-oauth-app',
      },
    });

    if (!userResponse.ok) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/?error=user_fetch_failed' },
      });
    }

    const userData = await userResponse.json();

    // Verify user is authorized admin
    const AUTHORIZED_USERS = ['jolyssa']; // Replace with your GitHub username if different
    
    if (!AUTHORIZED_USERS.includes(userData.login)) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/?error=unauthorized' },
      });
    }

    // Create secure session token
    const sessionData = {
      user: userData.login,
      name: userData.name || userData.login,
      avatar: userData.avatar_url,
      email: userData.email,
      created: Date.now(),
      expires: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Base64 encode session data
    // Note: For enhanced security, consider using proper JWT library with signing
    const sessionToken = btoa(JSON.stringify(sessionData));

    // Detect mobile user agent
    const userAgent = context.request.headers.get('user-agent') || '';
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
    
    if (isMobile) {
      // For mobile: return HTML page that sets cookie and redirects
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="refresh" content="2;url=/admin">
          <title>Logging in...</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #2D2D2D;
              color: #E5E5E5;
            }
            .message {
              text-align: center;
              padding: 2rem;
            }
            .spinner {
              border: 4px solid #3A3A3A;
              border-top: 4px solid #4791B1;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 1rem;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="message">
            <div class="spinner"></div>
            <p>Logging in... Redirecting to admin panel.</p>
            <p style="font-size: 0.9em; opacity: 0.7; margin-top: 1rem;">Welcome back, ${userData.name || userData.login}!</p>
          </div>
          <script>
            console.log('[Mobile Auth] Setting cookie and redirecting...');
            // Fallback redirect in case meta refresh doesn't work
            setTimeout(() => {
              console.log('[Mobile Auth] Fallback redirect triggered');
              window.location.href = '/admin';
            }, 2000);
          </script>
        </body>
        </html>
      `, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
          'Set-Cookie': `admin_session=${sessionToken}; Domain=jolyssa.space; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`,
        },
      });
    }
    
    // Desktop: immediate redirect (existing code)
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/admin',
        'Set-Cookie': `admin_session=${sessionToken}; Domain=jolyssa.space; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`,
      },
    });

  } catch (error) {
    // Catch-all for unexpected errors
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/?error=server_error' },
    });
  }
}

// Handle POST requests (some OAuth flows may use POST)
export async function onRequestPost(context) {
  return onRequestGet(context);
}
