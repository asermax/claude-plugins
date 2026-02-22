# VCS/Git Package Instructions

Instructions for creating AUR packages that track upstream git repositories.

Reference: [VCS package guidelines](https://wiki.archlinux.org/title/VCS_package_guidelines)

## Package Naming

Add `-git` suffix to package name:

```bash
pkgname=<package-name>-git
```

## Key Differences from Regular Packages

```bash
makedepends=('git' ...)        # Must include 'git'
provides=('<package-name>')    # Provides the non-VCS package
conflicts=('<package-name>')   # Conflicts with non-VCS package
sha256sums=('SKIP')            # Checksums not applicable for git
```

## Source Format

```bash
source=("$pkgname::git+https://github.com/user/repo.git")
```

For specific branches:

```bash
source=("$pkgname::git+https://github.com/user/repo.git#branch=develop")
```

## pkgver() Function

The `pkgver()` function generates the version string from the git repository.

### For Repositories with Tags

```bash
pkgver() {
  cd "$pkgname"
  git describe --long --tags | sed 's/^v//;s/\([^-]*-g\)/r\1/;s/-/./g'
}
```

This transforms:
- `v1.2.3` → `1.2.3`
- `v1.2.3-14-gabcdef1` → `1.2.3.r14.gabcdef1`

### For Repositories without Tags

```bash
pkgver() {
  cd "$pkgname"
  printf "r%s.%s" "$(git rev-list --count HEAD)" "$(git rev-parse --short HEAD)"
}
```

This produces: `r123.abcdef1`

## Complete Example

```bash
pkgname=ripgrep-git
pkgver=r350.8aab5f8
pkgrel=1
pkgdesc="A search tool that combines the usability of ag with the raw speed of grep (git version)"
arch=('x86_64')
url="https://github.com/BurntSushi/ripgrep"
license=('MIT')
depends=('gcc-libs' 'glibc')
makedepends=('cargo' 'git')
provides=('ripgrep')
conflicts=('ripgrep')
source=("$pkgname::git+https://github.com/BurntSushi/ripgrep.git")
sha256sums=('SKIP')

pkgver() {
  cd "$pkgname"
  printf "r%s.%s" "$(git rev-list --count HEAD)" "$(git rev-parse --short HEAD)"
}

prepare() {
  cd "$pkgname"
  export RUSTUP_TOOLCHAIN=stable
  cargo fetch --locked --target "$(rustc -vV | sed -n 's/host: //p')"
}

build() {
  cd "$pkgname"
  export RUSTUP_TOOLCHAIN=stable
  export CARGO_TARGET_DIR=target
  cargo build --frozen --release
}

package() {
  cd "$pkgname"
  install -Dm755 "target/release/rg" "$pkgdir/usr/bin/rg"
  install -Dm644 "LICENSE-MIT" "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
}
```

## Version Bumping

VCS packages don't need manual version bumping - the `pkgver()` function generates it automatically. However, the package should be rebuilt periodically to track upstream changes.
