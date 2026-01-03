---
description: Create a new AUR package
argument-hint: <package-name> <source-type>
---

Create a new AUR package with the following specifications:

Package name: $1
Source type: $2

Follow these steps:

1. Create a new directory for the package named after the package name
2. Create a .gitignore file to exclude build artifacts
3. Create a PKGBUILD file following the structure below (use placeholder checksums initially)
4. Generate checksums using `updpkgsums` (skip for -git packages using `sha256sums=('SKIP')`)
5. **Build and validate the package** using `makepkg -f` to ensure it compiles correctly
6. Generate the .SRCINFO file using `makepkg --printsrcinfo > .SRCINFO`
7. Initialize a git repository
8. Set up the AUR remote: `ssh://aur@aur.archlinux.org/<package-name>.git`
9. Create the initial commit using conventional commits format: "feat: initial commit for <package-name>"

## Useful Commands Reference

- `updpkgsums` - Update sha256sums in PKGBUILD from source files
- `makepkg --printsrcinfo > .SRCINFO` - Generate .SRCINFO metadata file
- `makepkg -f` - Build the package (force rebuild)
- `makepkg -si` - Build and install the package
- `namcap PKGBUILD` - Lint PKGBUILD for common issues
- `namcap *.pkg.tar.zst` - Lint built package

## .gitignore

Create a .gitignore file with the following content:

```
pkg
src
<package-name>-*
*.tar.zst
```

For NPM packages, replace `<package-name>` with the actual package name (without scope for scoped packages).

## Common PKGBUILD Structure

All PKGBUILD files should include:

```bash
pkgname=<package-name>
pkgver=<version>
pkgrel=1
pkgdesc="<package description>"
arch=(any)  # or (x86_64) for architecture-specific packages
url="<upstream-url>"
license=('<license>')
depends=()  # runtime dependencies
makedepends=()  # build-time dependencies
source=(<source-url>)
sha256sums=('SKIP')  # Use 'SKIP' initially, then run updpkgsums to generate actual checksums

package() {
  # Package installation steps
}
```

## NPM Package Specific Instructions

For NPM packages, use these specific settings:

**Package metadata:**
- `arch=(any)` - NPM packages are architecture-independent
- `depends=('npm')` - Requires npm at runtime
- `makedepends=('jq')` - Requires jq for build process

**Source configuration:**
- For unscoped packages: `source=(http://registry.npmjs.org/$pkgname/-/$pkgname-$pkgver.tgz)`
- For scoped packages (e.g., @google/jules): `source=(https://registry.npmjs.org/@scope/package/-/package-$pkgver.tgz)`
- `noextract=(package-$pkgver.tgz)` - Prevent automatic extraction

**Get package info:**
- Version: `npm view <npm-package-name> version`

**package() function:**
```bash
package() {
  npm install -g --cache "${srcdir}/npm-cache" --prefix "$pkgdir/usr" "$srcdir/<tarball-name>"

  # Fix permissions
  find "$pkgdir"/usr -type d -exec chmod 755 {} +

  # Remove references to pkgdir
  find "$pkgdir" -type f -name package.json -print0 | xargs -0 sed -i "/_where/d"

  # Remove references to srcdir
  local tmppackage="$(mktemp)"
  local pkgjson="$pkgdir/usr/lib/node_modules/<package-path>/package.json"
  jq '.|=with_entries(select(.key|test("_.+")|not))' "$pkgjson" > "$tmppackage"
  mv "$tmppackage" "$pkgjson"
  chmod 644 "$pkgjson"

  # npm gives ownership of ALL FILES to build user
  # https://bugs.archlinux.org/task/63396
  chown -R root:root "${pkgdir}"
}
```

**Notes for scoped packages:**
- The `pkgjson` path for scoped packages: `$pkgdir/usr/lib/node_modules/@scope/package/package.json`
- For unscoped packages: `$pkgdir/usr/lib/node_modules/$pkgname/package.json`

**Add this comment before package():**
```bash
# For more info about this package see:
# https://wiki.archlinux.org/index.php/Node.js_package_guidelines
```

## Go Package Specific Instructions

See [Go package guidelines](https://wiki.archlinux.org/title/Go_package_guidelines).

**Package metadata:**
- `arch=('x86_64')` - Go compiles to native binaries
- `depends=('glibc')` - Standard runtime dependency
- `makedepends=('go>=X.XX')` - Check go.mod for version requirement

**Required build flags:**
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

**Go modules download (in prepare):**
```bash
go mod download
```

> **Important**: Do NOT set `GOPATH` when downloading modules. Setting `GOPATH="${srcdir}/gopath"` before `go mod download` causes dependencies to be installed in a custom folder inside the build directory, leading to permission issues during cleanup (root-owned files). The `GOPATH` should only be set in `build()` where it controls intermediate build artifacts.

## VCS/Git Package Specific Instructions (-git)

See [VCS package guidelines](https://wiki.archlinux.org/title/VCS_package_guidelines).

**Key differences from regular packages:**
- Package name suffix: `-git`
- `makedepends` must include `'git'`
- `provides=('pkgname')` and `conflicts=('pkgname')`
- `sha256sums=('SKIP')`

**Source format:**
```bash
source=("$pkgname::git+https://github.com/user/repo.git")
```

**pkgver() for repos with tags:**
```bash
pkgver() {
  cd "$pkgname"
  git describe --long --tags | sed 's/^v//;s/\([^-]*-g\)/r\1/;s/-/./g'
}
```

**pkgver() for repos without tags:**
```bash
pkgver() {
  cd "$pkgname"
  printf "r%s.%s" "$(git rev-list --count HEAD)" "$(git rev-parse --short HEAD)"
}
```

## Binary Package Specific Instructions (-bin)

For packages distributing pre-compiled binaries from GitHub releases.

**Key differences from regular packages:**
- Package name suffix: `-bin`
- `arch=('x86_64')` - Architecture-specific
- `provides=('pkgname')` and `conflicts=('pkgname' 'pkgname-git')`
- No makedepends (no compilation)

**Source from GitHub releases:**
```bash
source_x86_64=("${url}/releases/download/v${pkgver}/${_pkgname}-${pkgver}-linux-amd64.tar.gz")
```

**latestver() helper for version detection:**
```bash
latestver() {
  curl -s "https://api.github.com/repos/user/repo/releases/latest" | \
    grep '"tag_name":' | sed -E 's/.*"v([^"]+)".*/\1/' || true
}
```
