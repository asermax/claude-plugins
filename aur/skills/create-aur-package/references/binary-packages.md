# Binary Package Instructions

Instructions for creating AUR packages that distribute pre-compiled binaries from GitHub releases.

## Package Naming

Add `-bin` suffix to package name:

```bash
pkgname=<package-name>-bin
```

## Key Differences from Source Packages

```bash
arch=('x86_64')               # Architecture-specific
provides=('<package-name>')   # Provides the source package
conflicts=('<package-name>' '<package-name>-git')  # Conflicts with other versions
# No makedepends needed (no compilation)
```

## Source from GitHub Releases

Use architecture-specific source arrays:

```bash
source_x86_64=("${url}/releases/download/v${pkgver}/${_pkgname}-${pkgver}-linux-amd64.tar.gz")
sha256sums_x86_64=('SKIP')
```

For multiple architectures:

```bash
source_x86_64=("${url}/releases/download/v${pkgver}/${_pkgname}-${pkgver}-linux-amd64.tar.gz")
source_aarch64=("${url}/releases/download/v${pkgver}/${_pkgname}-${pkgver}-linux-arm64.tar.gz")
sha256sums_x86_64=('SKIP')
sha256sums_aarch64=('SKIP')
```

## Version Detection Helper

For automatic version detection during bump-version:

```bash
latestver() {
  curl -s "https://api.github.com/repos/user/repo/releases/latest" | \
    grep '"tag_name":' | sed -E 's/.*"v([^"]+)".*/\1/' || true
}
```

Usage:
```bash
latestver  # Returns: 1.2.3
```

## package() Function

Binary packages typically just extract and install:

```bash
package() {
  install -Dm755 "${_pkgname}" "$pkgdir/usr/bin/${_pkgname}"
  install -Dm644 "LICENSE" "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
}
```

## Complete Example

```bash
pkgname=fzf-bin
_pkgname=fzf
pkgver=0.45.0
pkgrel=1
pkgdesc="Command-line fuzzy finder (pre-compiled binary)"
arch=('x86_64')
url="https://github.com/junegunn/fzf"
license=('MIT')
provides=('fzf')
conflicts=('fzf' 'fzf-git')
source_x86_64=("${url}/releases/download/v${pkgver}/${_pkgname}-${pkgver}-linux_amd64.tar.gz")
sha256sums_x86_64=('SKIP')

package() {
  install -Dm755 "${_pkgname}" "$pkgdir/usr/bin/${_pkgname}"
  install -Dm644 "LICENSE" "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
}
```

## Notes

- Binary packages don't need `prepare()`, `build()`, or `check()` functions
- Always verify the binary works on Arch Linux before publishing
- Include license file if available in the release
- Consider checksum verification for security
