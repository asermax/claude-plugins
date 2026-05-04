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

## Disabling strip for self-contained runtimes

makepkg auto-strips ELF binaries by default. For binaries produced by
"compile to standalone" tools that embed code/bytecode/data into the
executable itself (Bun, Deno, Node SEA / pkg / nexe, PyInstaller,
single-file Go binaries that read embedded data, etc.), stripping can
remove or corrupt the embedded segment. The resulting binary then either
crashes or falls back to the host runtime's CLI (e.g. a bun-compiled
binary will print Bun's help instead of running the embedded program).

When packaging this kind of binary, disable stripping:

```bash
options=('!strip')
```

### Bun standalone binaries

Upstreams that ship Bun-compiled binaries (`bun build --compile`)
**always** need `options=('!strip')`. Symptoms when this is missing:

- `<binary> --version` prints Bun's version/help instead of the app's
- Running the binary with no args drops into Bun's CLI usage
- The unstripped binary from the upstream tarball works correctly when
  invoked directly, but the installed `/usr/bin/<binary>` does not

How to recognize a Bun-compiled binary upfront:

- Upstream's `package.json` uses Bun (e.g. `@types/bun`, `"build":
  "bun build --compile ..."`, scripts run via `bun`)
- Release assets are large single-file binaries (~50–150 MB) containing
  the entire Bun runtime
- `strings <binary> | grep -i 'bun is a fast'` matches

The same caveat applies to Deno (`deno compile`) and Node single-executable
applications — when in doubt, set `options=('!strip')` and verify the
installed binary behaves the same as the one in the upstream tarball.

## Notes

- Binary packages don't need `prepare()`, `build()`, or `check()` functions
- Always verify the binary works on Arch Linux before publishing
- Include license file if available in the release
- Consider checksum verification for security
- **Always test the installed binary** (`/usr/bin/<name> --version` or
  similar), not just the one extracted into `src/`. makepkg's strip pass
  runs between extraction and install, and is a common source of bugs
  for binaries that embed runtime data.
