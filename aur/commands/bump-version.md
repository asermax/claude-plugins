---
description: Bump the AUR package version, update checksums, and commit
args:
  version:
    description: The new version to bump to (e.g., 48.2.7). If not provided, automatically detect the latest version from the package source.
    required: false
---

Bump the AUR package to the specified version or automatically detect the latest version from the package source.

Steps:
1. If no version argument is provided, automatically determine the latest version:
   - Read the PKGBUILD file and extract the source URL(s)
   - Attempt to determine the latest version from the source (use web search, API calls, or URL inspection as appropriate)
   - If a version is found, ask the user to confirm it's correct before proceeding
   - If unable to determine the version, inform the user and ask them to provide it manually
2. Update the `pkgver` in PKGBUILD to the new version
3. Run `updpkgsums` to update the checksums
4. Generate the .SRCINFO file using `makepkg --printsrcinfo > .SRCINFO`
5. Stage the changes, commit with message "chore: bump to <version>" using conventional commits, and push to AUR

Make sure to use the version number without the 'v' prefix (e.g., 48.2.7, not v48.2.7).
