# Go Package Instructions

Instructions for creating AUR packages from Go modules.

Reference: [Go package guidelines](https://wiki.archlinux.org/title/Go_package_guidelines)

## Package Metadata

```bash
arch=('x86_64')          # Go compiles to native binaries
depends=('glibc')        # Standard runtime dependency
makedepends=('go>=X.XX') # Check go.mod for version requirement
```

## prepare() Function

Download Go modules:

```bash
prepare() {
  cd "$pkgname"
  go mod download
}
```

> **Important**: Do NOT set `GOPATH` when downloading modules. Setting `GOPATH="${srcdir}/gopath"` before `go mod download` causes dependencies to be installed in a custom folder inside the build directory, leading to permission issues during cleanup (root-owned files). The `GOPATH` should only be set in `build()` where it controls intermediate build artifacts.

## build() Function

```bash
build() {
  cd "$pkgname"
  export GOPATH="${srcdir}/gopath"
  export CGO_CPPFLAGS="${CPPFLAGS}"
  export CGO_CFLAGS="${CFLAGS}"
  export CGO_CXXFLAGS="${CXXFLAGS}"
  export CGO_LDFLAGS="${LDFLAGS}"
  export GOFLAGS="-buildmode=pie -trimpath -ldflags=-linkmode=external -mod=readonly -modcacherw"

  go build -o <binary> ./cmd/<binary>
}
```

## package() Function

```bash
package() {
  cd "$pkgname"
  install -Dm755 "<binary>" "$pkgdir/usr/bin/<binary>"
  install -Dm644 "LICENSE" "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
}
```

## Build Flags Explained

| Flag | Purpose |
|------|---------|
| `-buildmode=pie` | Build as Position Independent Executable (security) |
| `-trimpath` | Remove file system paths from binary (reproducible) |
| `-ldflags=-linkmode=external` | Use external linker |
| `-mod=readonly` | Don't modify go.mod/go.sum |
| `-modcacherw` | Make module cache writable (cleanup friendly) |

## Complete Example

```bash
pkgname=hugo
pkgver=0.121.0
pkgrel=1
pkgdesc="Fast and flexible static site generator"
arch=('x86_64')
url="https://gohugo.io/"
license=('Apache')
depends=('glibc')
makedepends=('go>=1.21')
source=("https://github.com/gohugoio/hugo/archive/v$pkgver/$pkgname-$pkgver.tar.gz")
sha256sums=('SKIP')

prepare() {
  cd "$pkgname-$pkgver"
  go mod download
}

build() {
  cd "$pkgname-$pkgver"
  export GOPATH="${srcdir}/gopath"
  export CGO_CPPFLAGS="${CPPFLAGS}"
  export CGO_CFLAGS="${CFLAGS}"
  export CGO_CXXFLAGS="${CXXFLAGS}"
  export CGO_LDFLAGS="${LDFLAGS}"
  export GOFLAGS="-buildmode=pie -trimpath -ldflags=-linkmode=external -mod=readonly -modcacherw"

  go build -o hugo .
}

package() {
  cd "$pkgname-$pkgver"
  install -Dm755 hugo "$pkgdir/usr/bin/hugo"
  install -Dm644 LICENSE "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
}
```
