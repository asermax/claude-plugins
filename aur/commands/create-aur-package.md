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
4. Generate checksums using `updpkgsums`
5. Generate the .SRCINFO file using `makepkg --printsrcinfo`
6. Initialize a git repository
7. Set up the AUR remote: `ssh://aur@aur.archlinux.org/<package-name>.git`
8. Create the initial commit using conventional commits format: "feat: initial commit for <package-name> v<version>"

## .gitignore

Create a .gitignore file with the following content:

```
pkg
src
<package-name>-*
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
