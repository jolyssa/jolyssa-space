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

    // Set secure session cookie and redirect to admin dashboard
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
