---
name: create-aur-package
description: This skill should be used when the user asks to "create an AUR package", "make a new AUR package", "scaffold AUR package", "create PKGBUILD", "package for AUR", or mentions AUR package creation with a specific source type (npm, rust, go, git, binary). Provides comprehensive guidance for creating Arch User Repository packages with proper structure, checksums, and git setup.
argument-hint: <package-name> <source-type>
---

Create a new AUR (Arch User Repository) package with proper structure, validation, and git setup.

Package name: $ARGUMENTS[0]
Source type: $ARGUMENTS[1]

## Workflow

1. **Gather package information**:
   - Package name (provided by user)
   - Source type (npm, rust, go, git, binary)
   - Fetch metadata from upstream (version, description, license, URL)

2. **Create package directory structure**:
   - Directory named after the package
   - `.gitignore` for build artifacts
   - `PKGBUILD` with appropriate structure for source type

3. **Generate checksums** (skip for `-git` packages):
   ```bash
   updpkgsums
   ```

4. **Build and validate**:
   ```bash
   makepkg -f              # Build the package
   namcap PKGBUILD         # Lint PKGBUILD
   namcap *.pkg.tar.zst    # Lint built package
   ```

5. **Generate metadata**:
   ```bash
   makepkg --printsrcinfo > .SRCINFO
   ```

6. **Initialize git and push to AUR**:
   ```bash
   git init
   git remote add origin ssh://aur@aur.archlinux.org/<package-name>.git
   git add .
   git commit -m "feat: initial commit for <package-name>"
   git push -u origin master
   ```

## .gitignore

Create with the following content:

```
pkg
src
<package-name>-*
*.tar.zst
```

For NPM packages, use the actual package name (without scope for scoped packages).

## Common PKGBUILD Structure

All PKGBUILD files include these fields:

```bash
pkgname=<package-name>
pkgver=<version>
pkgrel=1
pkgdesc="<package description>"
arch=(any)  # or (x86_64) for architecture-specific
url="<upstream-url>"
license=('<license>')
depends=()      # runtime dependencies
makedepends=()  # build-time dependencies
source=(<source-url>)
sha256sums=('SKIP')  # Update with updpkgsums

package() {
  # Installation steps
}
```

## Source-Specific Instructions

Load the appropriate reference file based on source type:

- **NPM packages**: See `references/npm-packages.md` - For Node.js packages from npm registry
- **Rust packages**: See `references/rust-packages.md` - For Cargo-based Rust projects
- **Go packages**: See `references/go-packages.md` - For Go modules
- **VCS/Git packages**: See `references/vcs-packages.md` - For `-git` packages tracking upstream
- **Binary packages**: See `references/binary-packages.md` - For pre-compiled binaries

## Useful Commands

| Command | Purpose |
|---------|---------|
| `updpkgsums` | Update sha256sums from source files |
| `makepkg --printsrcinfo > .SRCINFO` | Generate .SRCINFO metadata |
| `makepkg -f` | Build package (force rebuild) |
| `makepkg -si` | Build and install package |
| `namcap PKGBUILD` | Lint PKGBUILD for issues |
| `namcap *.pkg.tar.zst` | Lint built package |

## Package Naming Conventions

- **Standard**: `<package-name>` - For release tarballs
- **VCS tracking**: `<package-name>-git` - For git repositories
- **Binary**: `<package-name>-bin` - For pre-compiled binaries

## Additional Resources

### Reference Files

- **`references/npm-packages.md`** - NPM package specifics (scoped packages, registry URLs, permission fixes)
- **`references/rust-packages.md`** - Rust/Cargo package specifics (build flags, LTO issues, workspaces)
- **`references/go-packages.md`** - Go module specifics (build flags, GOPATH handling)
- **`references/vcs-packages.md`** - VCS/Git package specifics (pkgver() function, provides/conflicts)
- **`references/binary-packages.md`** - Binary package specifics (release downloads, architecture handling)

### Examples

- **`examples/pkgbuild-template`** - Basic PKGBUILD template structure
