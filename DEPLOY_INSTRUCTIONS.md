# Deploy Instructions

## Cloudflare Pages Deployment

The `web/` directory deploys to Cloudflare Pages via GitHub Actions (`.github/workflows/deploy.yml`).

- **Project name**: `constraint-theory`
- **URL**: https://constraint-theory.superinstance.ai
- **Required secrets**: `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` (set in GitHub repo settings)

## Troubleshooting

If the site shows a 403 error, check that the Cloudflare Pages project exists and is configured to serve `index.html`.

## Note on wrangler.toml

The `wrangler.toml` in `web/` is for the Workers API (separate from Pages static hosting). The Pages deployment does not use or reference it.
