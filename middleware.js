// Vercel Edge Middleware for basic auth on Storybook
const AUTHORIZED_USERS = [
  { username: 'ralph', password: 'storybook2024' },
  { username: 'kat', password: 'fernandez' },
  { username: 'kelbz', password: 'itaewon' },
];

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

      const isAuthorized = AUTHORIZED_USERS.some(
        (u) => u.username === user && u.password === pass
      );

      if (!isAuthorized) {
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
