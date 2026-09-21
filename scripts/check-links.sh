#!/usr/bin/env bash
# Checks every http(s) URL in the built page and bundle; LinkedIn answers 999 (bot wall).
cd "$(dirname "$0")/.." || exit 1
grep -o -h -E 'https?://[^"<`'"'"' )]+' dist/index.html dist/assets/index-*.js | sort -u | while read -r u; do
  printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -L "$u")" "$u"
done
