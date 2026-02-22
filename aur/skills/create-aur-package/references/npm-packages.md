# NPM Package Instructions

Instructions for creating AUR packages from NPM registry packages.

## Package Metadata

```bash
arch=(any)           # NPM packages are architecture-independent
depends=('npm')      # Requires npm at runtime
makedepends=('jq')   # Requires jq for JSON processing
```

## Source Configuration

**Unscoped packages:**
```bash
source=(http://registry.npmjs.org/$pkgname/-/$pkgname-$pkgver.tgz)
```

**Scoped packages** (e.g., @google/jules):
```bash
source=(https://registry.npmjs.org/@scope/package/-/package-$pkgver.tgz)
```

**Prevent automatic extraction:**
```bash
noextract=(package-$pkgver.tgz)
```

## Get Package Info

Fetch latest version:
```bash
npm view <npm-package-name> version
```

## package() Function

```bash
# For more info about this package see:
# https://wiki.archlinux.org/index.php/Node.js_package_guidelines
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

## Scoped Package Paths

The `pkgjson` path differs based on package scope:

- **Scoped packages**: `$pkgdir/usr/lib/node_modules/@scope/package/package.json`
- **Unscoped packages**: `$pkgdir/usr/lib/node_modules/$pkgname/package.json`

## .gitignore for NPM

Replace `<package-name>` with the actual package name (without scope for scoped packages):

```
pkg
src
<package-name>-*
*.tar.zst
```

## Complete Example

```bash
pkgname=claude-code
pkgver=1.0.0
pkgrel=1
pkgdesc="Claude Code CLI"
arch=(any)
url="https://github.com/anthropics/claude-code"
license=('MIT')
depends=('npm')
makedepends=('jq')
source=(http://registry.npmjs.org/$pkgname/-/$pkgname-$pkgver.tgz)
noextract=($pkgname-$pkgver.tgz)
sha256sums=('SKIP')

package() {
  npm install -g --cache "${srcdir}/npm-cache" --prefix "$pkgdir/usr" "$srcdir/$pkgname-$pkgver.tgz"

  find "$pkgdir"/usr -type d -exec chmod 755 {} +
  find "$pkgdir" -type f -name package.json -print0 | xargs -0 sed -i "/_where/d"

  local tmppackage="$(mktemp)"
  local pkgjson="$pkgdir/usr/lib/node_modules/$pkgname/package.json"
  jq '.|=with_entries(select(.key|test("_.+")|not))' "$pkgjson" > "$tmppackage"
  mv "$tmppackage" "$pkgjson"
  chmod 644 "$pkgjson"

  chown -R root:root "${pkgdir}"
}
```
