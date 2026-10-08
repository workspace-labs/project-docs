#!/bin/sh
# Builder's tool, macOS only. Fills a fresh copy of the preview with a looks.js, as the skill itself would,
# and writes how it looks on a computer (1280 px) and on a phone (390 px), so the builder can look at it.
#
#   tools/shot-mac.sh skills/project-docs/examples/cedar-clinic/docs/design-preview/looks.js
#
# Output: /tmp/project-docs-shot/<folder>/ (wide.png, phone.png). Needs the Xcode command line tools.
set -eu

here=$(cd "$(dirname "$0")" && pwd)
repo=$(dirname "$here")
looks=${1:?usage: tools/shot-mac.sh <looks.js>}
name=$(basename "$(dirname "$(dirname "$(dirname "$looks")")")")
work=/tmp/project-docs-shot/$name
bin=/tmp/project-docs-shot/.shot-mac

mkdir -p "$work"
if [ ! -x "$bin" ] || [ "$here/shot-mac.swift" -nt "$bin" ]; then
  swiftc -O "$here/shot-mac.swift" -o "$bin" 2>/dev/null
fi

cp -R "$repo/skills/project-docs/assets/preview/." "$work/"
cp "$looks" "$work/looks.js"

status=0
"$bin" "$work/preview.html" "$work/wide.png" 1280 || status=$?
"$bin" "$work/preview.html" "$work/phone.png" 390 || true
echo "$work"
exit $status
