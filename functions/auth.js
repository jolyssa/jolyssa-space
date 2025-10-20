// Cloudflare Pages Function for GitHub OAuth
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // OAuth configuration
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  const redirectUri = `${url.origin}/admin/`;
  
  if (!clientId || !clientSecret) {
    return new Response('OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.', {
      status: 500
    });
  }
  
  // Handle OAuth callback
  if (url.searchParams.has('code')) {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code
        })
      });
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        // Return success page that stores token and redirects
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Authentication Success</title>
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
              <h1>Authentication Successful!</h1>
              <p>Redirecting to dashboard...</p>
              <script>
                // Store the token and redirect
                localStorage.setItem('github_token', '${tokenData.access_token}');
                localStorage.removeItem('oauth_state');
                
                // Clear URL parameters and redirect to admin
                window.location.href = '/admin';
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
          </head>
          <body>
            <h1>Authentication Failed</h1>
            <p>Error: ${error.message}</p>
            <p><a href="/admin/">Try again</a></p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400
      });
    }
  }
  
  // Redirect to GitHub OAuth
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', `${url.origin}/functions/auth`);
  githubAuthUrl.searchParams.set('scope', 'repo,user');
  githubAuthUrl.searchParams.set('state', url.searchParams.get('state') || 'cms');
  
  return Response.redirect(githubAuthUrl.toString(), 302);
}