#!/bin/sh
set -eu
if [ "${APERTUS_AUP_APPROVED:-0}" != "1" ]; then
  echo "Blocked: obtain human Apertus 1.5 AUP approval before inference" >&2
  exit 2
fi
exec /llama/build/bin/llama-server "$@"
