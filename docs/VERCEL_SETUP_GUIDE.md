# Vercel Setup Guide for profile.resu-me.ai

> **Linear Issue:** RES-514
> **Repository:** [resu-me-ai/public-profiles](https://github.com/resu-me-ai/public-profiles)
> **Target Domain:** profile.resu-me.ai
> **Last Updated:** 2026-01-02

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Connect GitHub Repository to Vercel](#step-1-connect-github-repository-to-vercel)
3. [Step 2: Configure Build Settings](#step-2-configure-build-settings)
4. [Step 3: Environment Variables](#step-3-environment-variables)
5. [Step 4: Domain Configuration](#step-4-domain-configuration)
6. [Step 5: Edge Middleware Configuration](#step-5-edge-middleware-configuration)
7. [Step 6: Deployment Verification](#step-6-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Access to the [resu-me-ai GitHub organization](https://github.com/resu-me-ai)
- [ ] Access to Vercel account (team: `resu-me-ai` or personal: `ralphhhbenedict`)
- [ ] Admin access to resu-me.ai DNS settings (Cloudflare/Namecheap/etc.)
- [ ] Production environment variable values ready

---

## Step 1: Connect GitHub Repository to Vercel

### 1.1 Import Project

1. Navigate to [vercel.com/new](https://vercel.com/new)
2. Select **"Import Git Repository"**
3. Choose the **resu-me-ai** GitHub organization
4. Select repository: `public-profiles`
5. Click **"Import"**

### 1.2 Project Configuration

On the import screen, configure:

| Setting | Value |
|---------|-------|
| Project Name | `public-profiles` (or `profile-resu-me-ai`) |
| Framework Preset | **Vite** (auto-detected) |
| Root Directory | `.` (leave as default) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 1.3 Team/Account Selection

**Recommended:** Use the `resu-me-ai` Vercel team for organization access.

If using personal account (`ralphhhbenedict`):
- Note: Personal account token is in `.env` as `VERCEL_TOKEN_PERSONAL`
- Production deployments should use the team account for proper billing

---

## Step 2: Configure Build Settings

### 2.1 Vite Configuration

The project uses Vite with React and SWC. The `vite.config.ts` is already configured:

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

### 2.2 Vercel Configuration

The `vercel.json` is pre-configured with routing for SPA + Storybook:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "routes": [
    {
      "src": "/storybook-js",
      "status": 308,
      "headers": { "Location": "/storybook-js/" }
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/storybook-js/(.*)",
      "dest": "/storybook-js/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2.3 Build Command Details

The build script in `package.json`:

```json
{
  "scripts": {
    "build": "vite build && storybook build -o dist/storybook-js"
  }
}
```

This produces:
- Main app at `/dist/index.html` (SPA)
- Storybook at `/dist/storybook-js/` (password-protected)

---

## Step 3: Environment Variables

### 3.1 Required Variables

Add these environment variables in Vercel Dashboard > Project > Settings > Environment Variables:

| Variable | Description | Scope | Value Source |
|----------|-------------|-------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | All | `https://dabpxdwkcxxoabsrxvfl.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | All | See `.env.local` (service role key) |
| `VITE_MIXPANEL_TOKEN` | Mixpanel project token | All | **Use Production Token** |
| `VITE_POSTHOG_KEY` | PostHog project key | All | `phc_CqKZWjhSLToygqHWpRUk8AuAnRDsr49I3yg8AmGQvsk` |
| `VITE_POSTHOG_HOST` | PostHog host | All | `https://us.i.posthog.com` |
| `VITE_GA4_MEASUREMENT_ID` | Google Analytics 4 ID | All | **Use Production ID** |

### 3.2 Environment Scopes

Configure different values per environment:

| Environment | Mixpanel Token | GA4 ID | Notes |
|-------------|----------------|--------|-------|
| **Production** | `[PROD_TOKEN]` | `G-509387164` | Production analytics |
| **Preview** | `e33a77b6ed1f2cb817270b89435ae93d` | `G-32CTKJLNRR` | Dev/staging analytics |
| **Development** | `e33a77b6ed1f2cb817270b89435ae93d` | `G-32CTKJLNRR` | Local dev (not used in Vercel) |

### 3.3 Analytics Token Reference

From `.env.local` comments:

```
# Mixpanel: Dev (3973375) | Prod (3857329)
# GA4: Dev (G-32CTKJLNRR) | Prod (G-509387164)
```

### 3.4 Adding Variables in Vercel

1. Go to **Project Settings** > **Environment Variables**
2. For each variable:
   - Enter **Key** (e.g., `VITE_SUPABASE_URL`)
   - Enter **Value**
   - Select **Environments**: Production, Preview, or both
   - Click **Save**

**Important:** Vite requires `VITE_` prefix for client-side environment variables.

---

## Step 4: Domain Configuration

### 4.1 Add Custom Domain in Vercel

1. Go to **Project Settings** > **Domains**
2. Click **"Add Domain"**
3. Enter: `profile.resu-me.ai`
4. Vercel will provide DNS configuration instructions

### 4.2 DNS Configuration Options

#### Option A: CNAME Record (Recommended for Subdomains)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `profile` | `cname.vercel-dns.com` | 300 |

#### Option B: A Record (Alternative)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `profile` | `76.76.21.21` | 300 |

### 4.3 SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt. After DNS propagation (5-30 minutes):

1. Vercel will verify domain ownership
2. SSL certificate will be issued automatically
3. HTTPS will be enforced

### 4.4 Additional Domains (Optional)

If supporting custom user domains (e.g., `ralphhhbenedict.com`):

1. Add domain in Vercel: `ralphhhbenedict.com`
2. Configure DNS for that domain:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

The middleware handles domain-to-username mapping automatically.

---

## Step 5: Edge Middleware Configuration

### 5.1 Middleware Location

The Edge Middleware is at `/middleware.js` (root level, not `/src`).

### 5.2 Middleware Functionality

The middleware handles:

1. **Domain Detection** - Identifies domain type (custom, profile, localhost)
2. **URL Rewriting** - Rewrites custom domains to internal `/@username` paths
3. **Storybook Authentication** - Basic auth for `/storybook-js` routes

### 5.3 Domain Types

| Hostname | Domain Type | Analytics Source |
|----------|-------------|------------------|
| `ralphhhbenedict.com` | `custom` | `custom_domain` |
| `profile.resu-me.ai` | `profile` | `profile_subdomain` |
| `localhost` | `localhost` | `development` |
| Other | `unknown` | `unknown` |

### 5.4 Custom Domain Mapping

The middleware contains a domain-to-username map:

```javascript
const CUSTOM_DOMAIN_MAP = {
  'ralphhhbenedict.com': 'ralphhhbenedict',
  'www.ralphhhbenedict.com': 'ralphhhbenedict',
};
```

To add new custom domains, update this map in `/middleware.js`.

### 5.5 Headers Set by Middleware

| Header | Description | Example |
|--------|-------------|---------|
| `x-domain-type` | Domain classification | `custom`, `profile`, `localhost` |
| `x-profile-username` | Resolved username | `ralphhhbenedict` |
| `x-analytics-source` | Tracking context | `custom_domain`, `profile_subdomain` |

### 5.6 Storybook Authentication

The `/storybook-js` route is protected by Basic Auth:

```javascript
const AUTHORIZED_USERS = [
  { username: 'ralph', password: 'storybook2024' },
  { username: 'kat', password: 'fernandez' },
  { username: 'kelbz', password: 'itaewon' },
];
```

**Note:** For production, consider moving credentials to environment variables.

### 5.7 Middleware Matcher

The middleware runs on all paths except static assets:

```javascript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## Step 6: Deployment Verification

### 6.1 Initial Deployment

After connecting the repository:

1. Vercel triggers automatic deployment on `main` branch push
2. Monitor build logs in Vercel Dashboard
3. Expected build time: ~2-3 minutes

### 6.2 Verification Checklist

After deployment, verify:

- [ ] Main app loads at `https://profile.resu-me.ai`
- [ ] Storybook loads at `https://profile.resu-me.ai/storybook-js/`
- [ ] Basic auth works for Storybook
- [ ] Analytics events fire (check Mixpanel/PostHog dashboards)
- [ ] Supabase connection works (profile data loads)
- [ ] Custom domain rewrite works (if configured)

### 6.3 Test Custom Domain Behavior

For `ralphhhbenedict.com`:

1. Visit `https://ralphhhbenedict.com`
2. Should display same content as `https://profile.resu-me.ai/@ralphhhbenedict`
3. Check browser DevTools Network tab for middleware headers

### 6.4 Monitor Deployment

1. **Functions tab** - Check Edge Middleware invocations
2. **Logs tab** - View runtime logs for errors
3. **Analytics tab** - Monitor traffic and performance

---

## Troubleshooting

### Build Failures

| Error | Solution |
|-------|----------|
| `npm ERR! missing script: build` | Verify `package.json` has `"build"` script |
| `vite: command not found` | Run `npm install` locally to verify deps |
| Storybook build fails | Check `@storybook/*` versions match |

### Domain Issues

| Issue | Solution |
|-------|----------|
| Domain not verifying | Wait 5-30 min for DNS propagation |
| SSL certificate pending | Ensure DNS records are correct |
| Redirect loop | Check `vercel.json` routing config |

### Middleware Issues

| Issue | Solution |
|-------|----------|
| Middleware not running | Verify `middleware.js` at root level |
| Headers not set | Check matcher pattern excludes path |
| Rewrite not working | Debug with `console.log` in middleware |

### Environment Variable Issues

| Issue | Solution |
|-------|----------|
| `undefined` values | Ensure `VITE_` prefix for client vars |
| Wrong environment | Check variable scope in Vercel settings |
| Values not updating | Redeploy after changing variables |

---

## Quick Reference

### Vercel Dashboard Links

- **Project Dashboard:** `https://vercel.com/resu-me-ai/public-profiles`
- **Deployments:** `https://vercel.com/resu-me-ai/public-profiles/deployments`
- **Settings:** `https://vercel.com/resu-me-ai/public-profiles/settings`
- **Environment Variables:** `https://vercel.com/resu-me-ai/public-profiles/settings/environment-variables`
- **Domains:** `https://vercel.com/resu-me-ai/public-profiles/settings/domains`

### CLI Commands (Reference Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy preview
vercel

# Deploy production
vercel --prod

# Pull env vars
vercel env pull .env.local
```

---

## Related Documents

- [VERCEL_GITHUB_CONSOLIDATION.md](./VERCEL_GITHUB_CONSOLIDATION.md) - Migration plan from personal to org
- [MIXPANEL_TRACKING_PLAN.md](./MIXPANEL_TRACKING_PLAN.md) - Analytics event specifications
- [PROFILE_BUILDER_STRATEGY.md](./PROFILE_BUILDER_STRATEGY.md) - Product strategy

---

**Created for:** RES-514 - Set up profile.resu-me.ai Vercel project
**Status:** Ready for implementation
**Next Steps:** Execute steps 1-6 in order
