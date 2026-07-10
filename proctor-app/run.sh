#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Serve the Design Proctor app locally for a single-machine demo.
# Usage:  ./run.sh [port]      (default port 8000)
# Open BOTH printed URLs in the SAME browser so they share data.
# ---------------------------------------------------------------------------
set -e
cd "$(dirname "$0")"
PORT="${1:-8000}"

echo "Design Proctor — single-machine demo"
echo "  Proctor console : http://localhost:${PORT}/proctor.html"
echo "  Participant page: http://localhost:${PORT}/index.html"
echo "Open BOTH in the same browser. Press Ctrl+C to stop."
echo

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "${PORT}"
elif command -v python >/dev/null 2>&1; then
  exec python -m SimpleHTTPServer "${PORT}"
else
  echo "Need Python to serve the files. Install Python 3, or use any static server," >&2
  echo "e.g.  npx serve .   (from inside proctor-app/)" >&2
  exit 1
fi
