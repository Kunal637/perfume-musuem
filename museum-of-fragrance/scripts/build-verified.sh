#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

command -v timeout || {
  echo "build-verified.sh requires GNU timeout." >&2
  exit 69
}

if [[ "${VERCEL:-}" == "1" ]]; then
  build_command="${SITES_PROJECT_ROOT}/node_modules/.bin/vite"
else
  build_command="${SITES_PROJECT_ROOT}/node_modules/.bin/vinext"
fi

if [[ ! -x "${build_command}" ]]; then
  echo "The build command is unavailable. Run npm run install:ci and wait for it to finish before building." >&2
  exit 69
fi

echo "Running bounded ${build_command##*/} build..."
timeout \
  --signal=TERM \
  --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" \
  "${SITES_BUILD_TIMEOUT:-3m}" \
  "${build_command}" build
