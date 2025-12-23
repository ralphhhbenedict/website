// Vercel Edge Middleware for basic auth on Storybook
const STORYBOOK_USER = 'ralph';
const STORYBOOK_PASS = 'storybook2024';

export default function middleware(request) {
  const url = new URL(request.url);

  // Only protect /storybook-js routes
  if (url.pathname.startsWith('/storybook-js')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return new Response('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Storybook"',
        },
      });
    }

    const [scheme, encoded] = authHeader.split(' ');

    if (scheme !== 'Basic' || !encoded) {
      return new Response('Invalid authentication', { status: 401 });
    }

    try {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(':');

      if (user !== STORYBOOK_USER || pass !== STORYBOOK_PASS) {
        return new Response('Invalid credentials', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Storybook"',
          },
        });
      }
    } catch (e) {
      return new Response('Invalid authentication', { status: 401 });
    }
  }

  // Continue to the requested page
  return;
}

export const config = {
  matcher: '/storybook-js/:path*',
};
