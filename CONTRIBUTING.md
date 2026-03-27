# Contributing to Constraint Theory

Thank you for your interest in contributing to this geometric computation library.
This project is licensed under the MIT license.

## Building and Testing

```bash
git clone https://github.com/SuperInstance/Constraint-Theory.git
cd Constraint-Theory
cargo build --release
cargo test --release
```

The core crate lives in `crates/constraint-theory-core/`. To work on it directly:

```bash
cd crates/constraint-theory-core
cargo build
cargo test --release
```

## Code Style

All code must meet these requirements before a PR will be merged:

- **Clippy clean**: `cargo clippy -- -D warnings` must pass with no warnings.
- **Formatted**: run `cargo fmt` before committing. CI will reject unformatted code.
- **Documented**: every public item needs a doc comment. The crate enforces
  `#![deny(missing_docs)]`, so undocumented public APIs will not compile.
- Write unit tests for new functionality and place them in a `#[cfg(test)]` module
  at the bottom of the relevant file.

## Contributions We Welcome

We are actively looking for help in these areas:

- **Higher-dimensional geometry** -- extending manifold support beyond 3D.
- **ML validation** -- using machine learning to validate geometric computations.
- **GPU implementations** -- compute-shader or CUDA/OpenCL backends for
  expensive operations.
- **Benchmarks** -- criterion or iai benchmarks for critical paths.
- **Case studies** -- real-world applications that exercise the library.

If your idea does not fit neatly into one of these categories, open an issue first
so we can discuss scope before you invest significant effort.

## Pull Request Process

1. **Fork** the repository and create a feature branch from `main`.
2. **Implement** your change, keeping commits focused and well-described.
3. **Test**: run `cargo test --release` and `cargo clippy -- -D warnings`.
4. **Format**: run `cargo fmt`.
5. **Push** your branch and open a Pull Request against `main`.
6. Fill in the PR template. Describe *what* changed and *why*.
7. A maintainer will review your PR. Please respond to feedback promptly.

Keep PRs small when possible. Large changes are easier to review when split into
a stack of incremental PRs.

## Reporting Issues

When filing a bug report, please include:

- **Operating system** and version (e.g., Ubuntu 24.04, macOS 15).
- **Rust version** (`rustc --version`).
- **Manifold configuration** -- dimensions, constraints, and parameters used.
- **Expected behavior** -- what you thought would happen.
- **Actual behavior** -- what happened instead, including any error output.
- A **minimal reproduction** if possible.

## Code of Conduct

This project follows the
[Rust Community Code of Conduct](https://www.rust-lang.org/policies/code-of-conduct).
We expect all participants to uphold these standards in every interaction.
