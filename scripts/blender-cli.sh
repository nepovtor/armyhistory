#!/usr/bin/env bash
set -euo pipefail

history_blender_bin="${HISTORY_BLENDER_BIN:-/Applications/Blender.app/Contents/MacOS/Blender}"

if [[ ! -x "$history_blender_bin" ]]; then
  printf 'Blender executable not found: %s\n' "$history_blender_bin" >&2
  printf 'Set HISTORY_BLENDER_BIN to the Blender executable path.\n' >&2
  exit 127
fi

exec "$history_blender_bin" "$@"
