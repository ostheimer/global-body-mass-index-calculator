#!/usr/bin/env bash
# Build a clean, deployable copy of the plugin into .wp-dist/<slug>/ so that
# Plugin Check (and later the SVN trunk) only ever sees shippable files.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SLUG="global-body-mass-index-calculator"
DEST="$ROOT/.wp-dist/$SLUG"

mkdir -p "$DEST"
rsync -a --delete \
	--exclude='.git' \
	--exclude='.github' \
	--exclude='.claude' \
	--exclude='.playwright-mcp' \
	--exclude='.wporg-assets' \
	--exclude='.wp-env.json' \
	--exclude='.wp-dist' \
	--exclude='.distignore' \
	--exclude='.gitignore' \
	--exclude='.editorconfig' \
	--exclude='bin' \
	--exclude='node_modules' \
	--exclude='*.zip' \
	--exclude='*.log' \
	--exclude='gbmi-shipping.png' \
	--exclude='ROADMAP.md' \
	"$ROOT/" "$DEST/"

echo "Synced clean plugin to $DEST"
