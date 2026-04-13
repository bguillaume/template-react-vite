# React + Vite Multi-Deploy Template

A React 18 + Vite + Tailwind CSS template configured to deploy to Vercel or Cloudflare Pages. Avoid vendor lock-in by supporting multiple deployment platforms with a single codebase.

## Quick Start

```bash
# Install dependencies
npm install

# Run locally
npm run dev
```

## Build Commands

```bash
# Build for production (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_API_URL=
```

Add your environment variables in:
- **Vercel**: Project → Settings → Environment Variables
- **Cloudflare Pages**: Project Settings → Environment Variables

## Deploy to Vercel

### Option 1: Vercel Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ShipFast-Syndicate/template-react-vite)

### Option 2: CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel deploy --prod
```

### Option 3: Git Integration

1. Push this repo to GitHub
2. Import project in Vercel dashboard
3. Deploy automatically on push

## Deploy to Cloudflare Pages

### Option 1: Git Integration

1. Push this repo to GitHub
2. Go to Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git
3. Select your repo
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Deploy

### Option 2: Direct Upload (CLI)

```bash
# Install Wrangler
npm i -g wrangler

# Login
wrangler login

# Deploy
npx wrangler pages deploy dist --project-name=your-project --branch=main
```

**Note**: Direct uploads do NOT inject environment variables set in the dashboard. Set them locally in `.env` before building, or use Git integration.

## Platform Comparison

| Feature | Vercel | Cloudflare Pages |
|---------|--------|------------------|
| Auto-deploy on push | ✅ | ✅ |
| Preview deployments | ✅ | ✅ |
| Custom domains | ✅ | ✅ |
| Free tier | ✅ | ✅ |
| Edge functions | ✅ | ✅ |
| Environment variables | Dashboard + CLI | Dashboard + CLI |

## Troubleshooting

### Build fails locally

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment variables not working

- **Vercel**: Ensure vars are set in Dashboard, not just locally. Redeploy after adding vars.
- **Cloudflare Pages**: Direct uploads (`wrangler pages deploy`) bypass dashboard env vars. Use Git integration.

### 404 on refresh (Vercel)

Ensure your `vercel.json` has rewrites configured:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Cloudflare Pages: Worker size limit

Cloudflare Workers have a 1MB limit on code size. If you hit this:
- Use external APIs instead of bundling large libraries
- Lazy-load heavy components

## Related Projects

- [ShipFast-Syndicate/astro-multi-deploy-template](https://github.com/ShipFast-Syndicate/astro-multi-deploy-template) - Astro version
- [ShipFast-Syndicate/dispatch](https://github.com/ShipFast-Syndicate/dispatch) - Newsletter platform
- [ShipFast-Syndicate/opensalary](https://github.com/ShipFast-Syndicate/opensalary) - Salary comparison

## License

MIT
## 🚀 Workflow & Best Practices

This template enforces a strict, automated workflow to ensure high code quality and clear history.

### 1. Branch Naming (Git Flow)
You **cannot** commit directly to random branch names.
Branches must start with one of the following prefixes:
`feature/`, `bugfix/`, `hotfix/`, `release/`, `chore/`, `feat/`, `fix/`, `docs/`, `refactor/`, `test/`.
*(Example: `feature/add-login-page`)*

### 2. Commit Convention (Conventional Commits)
We use the [Conventional Commits](https://www.conventionalcommits.org/) specification.
**Do not run `git commit` directly.**
Instead, stage your files and run the interactive helper:
```bash
npm run commit
```
This will guide you to format your commit message properly (e.g., `feat(auth): handle expired tokens`).
> Note: If you manually write a bad commit message, the `commitlint` hook will reject it.

### 3. Auto-Formatting (lint-staged)
When you commit, a pre-commit hook automatically runs **Prettier** (`lint-staged`) on all modified files. You never have to worry about formatting issues breaking the CI.

### 4. CI & Branch Protection
This template is designed to work with Pull Request-based workflows and GitHub branch protection.
- We recommend configuring GitHub branch protection rules for `main` and `develop` to block direct pushes, require PRs, and require approvals before merging.
- A basic GitHub Actions CI workflow is included. It automatically runs checks configured in the repository (such as `npm run lint` and `npm run build` if present).
- If you want automated tests to be required in CI, add a `test` script to your `package.json` and configure branch protection to require that check.
