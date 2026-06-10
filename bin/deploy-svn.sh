#!/usr/bin/env bash
#
# Prepare the WordPress.org SVN working copy for release.
#
# This script does everything EXCEPT the final commit:
#   1. checks out (or updates) the plugin's SVN repo,
#   2. mirrors the clean dist into trunk/,
#   3. mirrors the wordpress.org assets (icon, banner, screenshots) into assets/,
#   4. stages added/removed files,
#   5. creates the tags/<version> copy.
#
# It then prints the exact `svn commit` command for you to run with your
# WordPress.org account (the script never sends your credentials anywhere).
#
# Usage:  bash bin/deploy-svn.sh
set -euo pipefail

SLUG="global-body-mass-index-calculator"
VERSION="1.3"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/.wp-dist/$SLUG"
WPORG_ASSETS="$ROOT/.wporg-assets"
SVN_URL="https://plugins.svn.wordpress.org/$SLUG"
SVN_DIR="$ROOT/.svn-deploy"
TRUNK="$SVN_DIR/trunk"
ASSETS="$SVN_DIR/assets"

# 0. Build a fresh clean dist.
bash "$ROOT/bin/sync-dist.sh"

# 1. Check out trunk + assets + tags or update if already present.
if [ ! -d "$SVN_DIR/.svn" ]; then
	echo "Checking out $SVN_URL ..."
	svn checkout --depth=immediates "$SVN_URL" "$SVN_DIR"
	svn update --set-depth=infinity "$SVN_DIR/trunk"
	svn update --set-depth=infinity "$SVN_DIR/assets"
	svn update --set-depth=immediates "$SVN_DIR/tags"
else
	svn update "$SVN_DIR"
fi

# 2. Mirror the clean plugin into trunk (keep .svn metadata).
rsync -a --delete --exclude='.svn' "$DIST/" "$TRUNK/"
svn status "$TRUNK" | awk '/^!/ {print $2}' | while read -r f; do svn delete "$f" >/dev/null; done
svn add "$TRUNK" --force >/dev/null 2>&1 || true

# 3. Mirror the wordpress.org assets (icon, banner, screenshots) into assets/.
mkdir -p "$ASSETS"
rsync -a --delete --exclude='.svn' "$WPORG_ASSETS/" "$ASSETS/"
svn status "$ASSETS" | awk '/^!/ {print $2}' | while read -r f; do svn delete "$f" >/dev/null; done
svn add "$ASSETS" --force >/dev/null 2>&1 || true

# 4. Create the version tag from trunk.
if [ -d "$SVN_DIR/tags/$VERSION" ]; then
	echo "tags/$VERSION already exists locally — leaving it as is."
else
	svn copy "$TRUNK" "$SVN_DIR/tags/$VERSION"
fi

echo
echo "=========================================================================="
echo "SVN working copy prepared at: $SVN_DIR"
echo "  trunk/  = plugin code (version $VERSION)"
echo "  assets/ = icon, banner and screenshots (listing only, not in the download)"
echo "  tags/$VERSION = release snapshot"
echo
echo "Review the staged changes:"
echo "    svn status \"$SVN_DIR\""
echo
echo "When you are happy, COMMIT (you will be prompted for your wp.org password):"
echo "    svn commit \"$SVN_DIR\" --username helpstring \\"
echo "        -m \"Version $VERSION: fix stored XSS (CVE-2026-8883); security, UX, accessibility, i18n and listing-asset update\""
echo "=========================================================================="
