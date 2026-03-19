# CI/CD Guide - Constraint Theory

## Overview

This guide covers the CI/CD pipelines for the constrainttheory repository, including testing, building, security scanning, and deployment.

## Workflows

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests
- Manual workflow dispatch

**Jobs:**

1. **docs-scope**: Detects if changes are docs-only to skip heavy jobs
2. **rust-checks**: Rust formatting, clippy, and tests
3. **wasm-checks**: WASM build and testing
4. **python-checks**: Python linting, type checking, and tests
5. **node-checks**: TypeScript, linting, and tests
6. **browser-tests**: Playwright browser tests
7. **security-scan**: Security vulnerability scanning
8. **benchmarks**: Performance benchmarks (push to main only)

### Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch with environment selection

**Jobs:**

1. **deploy-pages**: Deploy to Cloudflare Pages
2. **deploy-wasm**: Publish WASM package to npm
3. **deploy-python**: Publish Python package to PyPI
4. **deploy-docker**: Build and push Docker image
5. **smoke-tests**: Post-deployment smoke tests

## Local Development

### Running Tests Locally

```bash
# Rust tests
cargo test --all-features

# WASM tests
cd packages/constraint-theory-wasm
wasm-pack test --node

# Python tests
pytest packages/constraint-theory-python --cov

# TypeScript tests
npm test

# Browser tests
npm run test:browser
```

### Building Locally

```bash
# Build all packages
npm run build

# Build WASM package
cd packages/constraint-theory-wasm
wasm-pack build --target web --scope superinstance

# Build Python package
cd packages/constraint-theory-python
python -m build
```

### Linting and Formatting

```bash
# Rust
cargo fmt --all
cargo clippy --all-targets --all-features

# Python
ruff check .
ruff format .

# TypeScript
npm run lint
npm run format
```

## CI/CD Best Practices

### 1. Fast Feedback Loops

- Docs-only changes skip heavy jobs
- Parallel job execution
- Caching strategies for dependencies

### 2. Caching

The workflows use multiple caching strategies:

```yaml
# Cargo registry cache
- uses: actions/cache@v4
  with:
    path: ~/.cargo/registry
    key: ${{ runner.os }}-cargo-registry-${{ hashFiles('**/Cargo.lock') }}

# pnpm store cache
- uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 3. Parallel Execution

Tests run in parallel across multiple jobs:

- Rust tests across stable/beta/nightly
- Python tests across 3.10/3.11/3.12
- Browser tests in multiple shards

### 4. Security Scanning

Automated security checks:

- Rust: `cargo audit`
- Python: `safety check`
- npm: `npm audit`
- Trivy: Container vulnerability scanning

## Deployment

### Automatic Deployment

Deployment happens automatically on push to `main`:

1. Build and test all packages
2. Deploy to Cloudflare Pages
3. Publish WASM to npm
4. Publish Python to PyPI
5. Build and push Docker image
6. Run smoke tests

### Manual Deployment

You can trigger a manual deployment via GitHub Actions:

1. Go to Actions tab
2. Select "Deploy" workflow
3. Click "Run workflow"
4. Choose environment (staging/production)

### Environment Variables

Required secrets for deployment:

```
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
NPM_TOKEN
PYPI_API_TOKEN
GITHUB_TOKEN
```

## Monitoring

### Performance Benchmarks

Benchmarks run on push to `main` and results are tracked:

```bash
# Run benchmarks locally
cargo bench --all-features
```

### Smoke Tests

Post-deployment smoke tests verify:

- Web interface is accessible
- API endpoints respond correctly
- WASM module loads properly
- Performance meets SLA

## Troubleshooting

### Common Issues

**Issue**: Cache miss on CI
```bash
# Clear caches manually via GitHub Actions UI
# Or update cache key by changing dependency files
```

**Issue**: WASM build fails
```bash
# Ensure wasm-pack is installed
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Build locally first
cd packages/constraint-theory-wasm
wasm-pack build --target web --scope superinstance
```

**Issue**: Python tests fail
```bash
# Ensure correct Python version
python --version  # Should be 3.10+

# Install dependencies
pip install -r packages/constraint-theory-python/requirements.txt

# Run tests locally
pytest packages/constraint-theory-python --cov
```

### CI Failures

1. Check the Actions tab for failure details
2. Reproduce locally using the same commands
3. Verify all dependencies are up to date
4. Check for environment-specific issues

### Deployment Failures

1. Verify all secrets are configured
2. Check Cloudflare Pages deployment logs
3. Verify npm/PyPI authentication
4. Check Docker build logs

## Release Process

1. Update version in `Cargo.toml`
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. CI/CD automatically:
   - Runs all tests
   - Builds all packages
   - Publishes to npm, PyPI, and Docker
   - Deploys to Cloudflare Pages

## Performance Targets

- CI runtime: < 15 minutes
- Build time: < 5 minutes
- Test coverage: > 80%
- Deployment time: < 10 minutes
- Smoke test time: < 2 minutes

## Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [wasm-pack Documentation](https://rustwasm.github.io/wasm-pack/)
