// Cloudflare Pages Function for GitHub OAuth
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // OAuth configuration
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return new Response('OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.', {
      status: 500
    });
  }
  
  // Handle OAuth callback (when GitHub redirects back with code)
  if (url.searchParams.has('code')) {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    try {
      console.log('Handling OAuth callback with code:', code);
      
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
      console.log('Token response:', tokenData.access_token ? 'Success' : 'Failed');
      
      if (tokenData.access_token) {
        // Verify the token works by getting user info
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User verified:', userData.login);
          
          // Check if user is authorized
          const allowedUsers = ['jolyssa', 'JojoW']; // Add your GitHub username(s)
          if (!allowedUsers.includes(userData.login)) {
            return new Response(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Access Denied</title>
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
                  <h1>Access Denied</h1>
                  <p>This admin panel is for joji only.</p>
                  <p>User: ${userData.login}</p>
                  <p><a href="/" style="color: #4791B1;">Go Home</a></p>
                </body>
              </html>
            `, {
              headers: { 'Content-Type': 'text/html' },
              status: 403
            });
          }
        }
        
        // Return success page that stores token and redirects to admin
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
                .loading {
                  color: #4791B1;
                }
              </style>
            </head>
            <body>
              <h1 class="loading">Authentication Successful! ✅</h1>
              <p>Redirecting to admin dashboard...</p>
              <script>
                console.log('OAuth callback success - storing token and redirecting');
                
                // Store the token and clear any temporary OAuth state
                localStorage.setItem('github_token', '${tokenData.access_token}');
                localStorage.removeItem('oauth_state');
                
                // Redirect to admin page (without any URL parameters)
                setTimeout(() => {
                  window.location.replace('/admin');
                }, 1000);
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
      } else {
        throw new Error('No access token received: ' + JSON.stringify(tokenData));
      }
    } catch (error) {
      console.error('OAuth error:', error);
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
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
            <h1>Authentication Failed ❌</h1>
            <p>Error: ${error.message}</p>
            <p><a href="/admin" style="color: #4791B1;">Try again</a></p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400
      });
    }
  }
  
  // If no code parameter, initiate OAuth flow
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', `${url.origin}/functions/auth`);
  githubAuthUrl.searchParams.set('scope', 'repo,user');
  githubAuthUrl.searchParams.set('state', url.searchParams.get('state') || 'cms');
  
  console.log('Redirecting to GitHub OAuth:', githubAuthUrl.toString());
  return Response.redirect(githubAuthUrl.toString(), 302);
}
