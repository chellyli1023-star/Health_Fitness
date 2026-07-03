#!/usr/bin/env bash
set -euo pipefail

git add .
if ! git diff --cached --quiet; then
  git commit -m "Update dashboard"
fi
git push origin main

echo "Dashboard deployed successfully."
