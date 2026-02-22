# Rust Package Instructions

Instructions for creating AUR packages from Rust/Cargo projects.

Reference: [Rust package guidelines](https://wiki.archlinux.org/title/Rust_package_guidelines)

## Package Metadata

```bash
arch=('x86_64')                  # Rust compiles to native binaries
depends=('gcc-libs' 'glibc')     # Standard runtime dependencies
makedepends=('cargo')            # Cargo includes the Rust compiler
```

## prepare() Function

Fetch dependencies before building:

```bash
prepare() {
  cd "$pkgname-$pkgver"
  export RUSTUP_TOOLCHAIN=stable
  cargo fetch --locked --target "$(rustc -vV | sed -n 's/host: //p')"
}
```

## build() Function

```bash
build() {
  cd "$pkgname-$pkgver"
  export RUSTUP_TOOLCHAIN=stable
  export CARGO_TARGET_DIR=target
  cargo build --frozen --release --all-features
}
```

## check() Function

Run tests (optional but recommended):

```bash
check() {
  cd "$pkgname-$pkgver"
  export RUSTUP_TOOLCHAIN=stable
  cargo test --frozen --all-features
}
```

> **Important**: Do NOT use `--release` in check() - this preserves debug assertions and overflow checking.

## package() Function

```bash
package() {
  cd "$pkgname-$pkgver"
  install -Dm0755 "target/release/$pkgname" "$pkgdir/usr/bin/$pkgname"
  install -Dm644 "LICENSE" "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
}
```

## Key Flags Explained

| Flag | Purpose |
|------|---------|
| `--frozen` | Prevents network access, uses only `Cargo.lock` versions (reproducible builds) |
| `--locked` | Ensures `Cargo.lock` is respected during fetch |
| `--release` | Creates optimized release binary |
| `--all-features` | Enables all package features (optional) |

## -git Packages

For VCS packages, add to makedepends:

```bash
makedepends=('cargo' 'git')
```

## Common Issues

### LTO Linking Errors with `ring` Crate

Rust packages that depend on the `ring` crate (used by `rustls`/`ureq` for TLS) can fail to link with LTO enabled. If you see undefined symbol errors like `ring_core_0_17_14__...`:

```bash
makedepends=('cargo')
options=(!lto)
```

### Workspace with Multiple Packages

If the project is a Cargo workspace with multiple packages and some have heavy dependencies (e.g., a GUI app using Tauri), build only the specific package needed instead of using `--all-features`:

```bash
# Build only the CLI package, not the whole workspace
cargo build --frozen --release -p <package-name>
```

## Complete Example

```bash
pkgname=ripgrep
pkgver=14.1.0
pkgrel=1
pkgdesc="A search tool that combines the usability of ag with the raw speed of grep"
arch=('x86_64')
url="https://github.com/BurntSushi/ripgrep"
license=('MIT')
depends=('gcc-libs' 'glibc')
makedepends=('cargo')
source=("$url/archive/$pkgver/$pkgname-$pkgver.tar.gz")
sha256sums=('SKIP')

prepare() {
  cd "$pkgname-$pkgver"
  export RUSTUP_TOOLCHAIN=stable
  cargo fetch --locked --target "$(rustc -vV | sed -n 's/host: //p')"
}

build() {
  cd "$pkgname-$pkgver"
  export RUSTUP_TOOLCHAIN=stable
  export CARGO_TARGET_DIR=target
  cargo build --frozen --release --all-features
}

check() {
  cd "$pkgname-$pkgver"
  export RUSTUP_TOOLCHAIN=stable
  cargo test --frozen --all-features
}

package() {
  cd "$pkgname-$pkgver"
  install -Dm0755 "target/release/rg" "$pkgdir/usr/bin/rg"
  install -Dm644 "LICENSE-MIT" "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
}
```
