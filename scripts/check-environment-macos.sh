#!/usr/bin/env bash
# Safe diagnostic by default; explicitly opt in to core install.
set -euo pipefail

MODE="${1:-check}"
if [[ "$MODE" != "check" && "$MODE" != "--install-core" ]]; then
  echo "Usage: bash scripts/check-environment-macos.sh [--install-core]" >&2
  exit 2
fi

check_cmd() {
  local name="$1"
  if command -v "$name" >/dev/null 2>&1; then
    printf '[OK] %-12s %s\n' "$name" "$(command -v "$name")"
  else
    printf '[MISSING] %-12s\n' "$name"
  fi
}

printf 'HIStory cinematic toolchain check (no tools are installed by default)\n'
printf 'Operating system: %s\n' "$(uname -s)"
check_cmd git
check_cmd codex
check_cmd node
check_cmd npm
check_cmd ffmpeg
check_cmd ffprobe
check_cmd python3
check_cmd blender
check_cmd rhubarb
check_cmd brew

if command -v node >/dev/null 2>&1; then
  node -e 'const major=Number(process.versions.node.split(".")[0]); console.log("Node version:",process.version, major>=20?"[OK >=20]":"[UPGRADE REQUIRED >=20]"); process.exitCode = major>=20?0:1' || true
fi

if [[ "$(uname -s)" == "Darwin" ]]; then
  [[ -d /Applications/Blender.app ]] && echo '[OK] Blender.app found' || true
  [[ -d /Applications/kdenlive.app || -d /Applications/Kdenlive.app ]] && echo '[OK] Kdenlive.app found' || true
  if command -v system_profiler >/dev/null 2>&1; then
    system_profiler SPHardwareDataType 2>/dev/null | grep -E '(Chip:|Processor Name:|Memory:)' | head -6 || true
  fi
fi

if [[ "$MODE" == "--install-core" ]]; then
  if [[ "$(uname -s)" != "Darwin" ]]; then
    echo 'Core installer is designed for macOS; use your operating system package manager.' >&2
    exit 1
  fi
  if ! command -v brew >/dev/null 2>&1; then
    echo 'Homebrew not present. Install it yourself from https://brew.sh/ and rerun. No curl|bash is executed.' >&2
    exit 1
  fi
  echo 'Installing core CLI packages with Homebrew...'
  brew install ffmpeg node git python
  echo 'Installing Blender and Kdenlive casks...'
  brew install --cask blender kdenlive
  echo 'Done. Optional ComfyUI/TTS/Rhubarb/AI models are NOT installed.'
fi
