# AppImage Package Instructions

Instructions for creating AUR packages that extract and install AppImage binaries (typically Electron apps).

## Package Naming

Add `-appimage` suffix to package name:

```bash
pkgname=<package-name>-appimage
_pkgname=<upstream-name>
```

## Key Differences from Binary Packages

```bash
arch=('x86_64')
depends=('gtk3' 'nss' 'alsa-lib')  # Common Electron dependencies
options=(!strip)                     # Do not strip pre-built binaries
provides=('<package-name>')
conflicts=('<package-name>' '<package-name>-bin' '<package-name>-git')
noextract=("${_pkgname}-${pkgver}.AppImage")  # Prevent automatic extraction
```

## .gitignore

Include `squashfs-root` and the AppImage file:

```
pkg
src
squashfs-root
<upstream-name>-*
*.AppImage
*.tar.zst
```

## Source from GitHub Releases

Use architecture-specific source arrays with `${CARCH}` to avoid namcap warnings:

```bash
source_x86_64=("${_pkgname}-${pkgver}.AppImage::https://github.com/user/repo/releases/download/v${pkgver}/${_pkgname}-${pkgver}-${CARCH}.AppImage")
sha256sums_x86_64=('SKIP')
```

If a license file is not bundled in the AppImage, download it separately:

```bash
source_x86_64=("${_pkgname}-${pkgver}.AppImage::https://github.com/user/repo/releases/download/v${pkgver}/${_pkgname}-${pkgver}-${CARCH}.AppImage"
                "LICENSE.md::https://raw.githubusercontent.com/user/repo/main/LICENSE.md")
sha256sums_x86_64=('SKIP' 'SKIP')
```

## Version Detection Helper

```bash
latestver() {
  curl -s "https://api.github.com/repos/user/repo/releases/latest" | \
    grep '"tag_name":' | sed -E 's/.*"v([^"]+)".*/\1/' || true
}
```

## prepare() Function

Extract the AppImage using `--appimage-extract`:

```bash
prepare() {
  cd "${srcdir}"
  chmod +x "${_pkgname}-${pkgver}.AppImage"
  ./"${_pkgname}-${pkgver}.AppImage" --appimage-extract > /dev/null 2>&1
}
```

## package() Function

Install extracted contents to `/opt/`, create launcher and desktop integration.

**IMPORTANT**: Before writing the `package()` function, check the actual filenames inside `squashfs-root/` after extraction.
Upstream apps often use an internal identifier that differs from the package name (e.g. `@supersetdesktop` instead of `superset`).
Run `ls squashfs-root/*.desktop` and check `squashfs-root/usr/share/icons/` to find the real names, then define an `_appid` variable accordingly.

```bash
package() {
  # Upstream app identifier (check squashfs-root/*.desktop to find the actual name)
  local _appid="<upstream-identifier>"

  install -d "${pkgdir}/opt/${pkgname}"
  cp -a squashfs-root/* "${pkgdir}/opt/${pkgname}/"

  # Fix directory permissions (AppImages default to 700)
  find "${pkgdir}/opt/${pkgname}" -type d -exec chmod 755 {} +

  # Chrome sandbox (required by Electron)
  if [[ -f "${pkgdir}/opt/${pkgname}/chrome-sandbox" ]]; then
    chmod 4755 "${pkgdir}/opt/${pkgname}/chrome-sandbox"
  fi

  # CLI launcher
  install -Dm755 /dev/stdin "${pkgdir}/usr/bin/${_pkgname}" <<EOF
#!/bin/bash
exec /opt/${pkgname}/AppRun "\$@"
EOF

  # Desktop entry (use _appid for source, _pkgname for installed name)
  install -Dm644 "squashfs-root/${_appid}.desktop" "${pkgdir}/usr/share/applications/${_pkgname}.desktop"
  sed -i "s|^Exec=.*|Exec=${_pkgname} %U|" "${pkgdir}/usr/share/applications/${_pkgname}.desktop"
  sed -i "s|^Icon=.*|Icon=${_pkgname}|" "${pkgdir}/usr/share/applications/${_pkgname}.desktop"

  # Icons (use _appid for source, _pkgname for installed name)
  for size in 16 32 48 64 128 256 512; do
    local _icon="squashfs-root/usr/share/icons/hicolor/${size}x${size}/apps/${_appid}.png"
    [[ -f "$_icon" ]] && install -Dm644 "$_icon" \
      "${pkgdir}/usr/share/icons/hicolor/${size}x${size}/apps/${_pkgname}.png"
  done

  # License
  install -Dm644 "${srcdir}/LICENSE" "${pkgdir}/usr/share/licenses/${pkgname}/LICENSE"
}
```

## Complete Example

```bash
pkgname=cursor-appimage
_pkgname=cursor
pkgver=2.5.26
pkgrel=1
pkgdesc="Cursor AI code editor (AppImage, extracted)"
arch=('x86_64')
url="https://www.cursor.com"
license=('custom')
depends=('gtk3' 'nss' 'alsa-lib')
options=(!strip)
provides=('cursor')
conflicts=('cursor' 'cursor-bin' 'cursor-git')
source_x86_64=("${_pkgname}-${pkgver}.AppImage::https://downloads.cursor.com/production/abc123/linux/x64/Cursor-${pkgver}-${CARCH}.AppImage")
sha256sums_x86_64=('SKIP')
noextract=("${_pkgname}-${pkgver}.AppImage")

latestver() {
  curl -s "https://api.github.com/repos/user/repo/releases/latest" | \
    grep '"tag_name":' | sed -E 's/.*"v([^"]+)".*/\1/' || true
}

prepare() {
  cd "${srcdir}"
  chmod +x "${_pkgname}-${pkgver}.AppImage"
  ./"${_pkgname}-${pkgver}.AppImage" --appimage-extract > /dev/null 2>&1
}

package() {
  local _appid="cursor"  # matches squashfs-root/cursor.desktop

  install -d "${pkgdir}/opt/${pkgname}"
  cp -a squashfs-root/* "${pkgdir}/opt/${pkgname}/"

  find "${pkgdir}/opt/${pkgname}" -type d -exec chmod 755 {} +

  if [[ -f "${pkgdir}/opt/${pkgname}/chrome-sandbox" ]]; then
    chmod 4755 "${pkgdir}/opt/${pkgname}/chrome-sandbox"
  fi

  install -Dm755 /dev/stdin "${pkgdir}/usr/bin/${_pkgname}" <<EOF
#!/bin/bash
exec /opt/${pkgname}/AppRun "\$@"
EOF

  install -Dm644 "squashfs-root/${_appid}.desktop" "${pkgdir}/usr/share/applications/${_pkgname}.desktop"
  sed -i "s|^Exec=.*|Exec=${_pkgname} %U|" "${pkgdir}/usr/share/applications/${_pkgname}.desktop"
  sed -i "s|^Icon=.*|Icon=${_pkgname}|" "${pkgdir}/usr/share/applications/${_pkgname}.desktop"

  for size in 16 32 48 64 128 256 512; do
    local _icon="squashfs-root/usr/share/icons/hicolor/${size}x${size}/apps/${_appid}.png"
    [[ -f "$_icon" ]] && install -Dm644 "$_icon" \
      "${pkgdir}/usr/share/icons/hicolor/${size}x${size}/apps/${_pkgname}.png"
  done
}
```

## Expected namcap Warnings

These warnings are normal for extracted AppImage packages and can be safely ignored:

- **ELF files outside of a valid path ('opt/')** - Expected for `/opt/` installs
- **ELF file lacks FULL RELRO / PIE** - Pre-compiled binaries, cannot be fixed
- **ELF file is unstripped** - Expected with `options=(!strip)`
- **File is setuid or setgid** - Chrome sandbox requires this
- **Dependency python detected** - False positive from bundled Windows-only scripts (e.g. winpty)
- **Unused shared library libpthread/libdl** - Legacy glibc references in pre-built binaries

## Notes

- AppImage packages use `prepare()` for extraction (unlike binary packages)
- Do NOT add `fuse2` as a dependency — it's only needed to run AppImages directly, not extracted ones
- Always install to `/opt/${pkgname}/` and create a launcher symlink in `/usr/bin/`
- Fix `.desktop` file `Exec=` and `Icon=` lines to work outside the AppImage container
- Use `options=(!strip)` to prevent stripping pre-built shared libraries
- Check for bundled icons in both `usr/share/icons/hicolor/` and the squashfs root
