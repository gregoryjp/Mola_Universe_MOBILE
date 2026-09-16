#!/usr/bin/env bash
# Mirrors the `npm run verify` gate: lint + typecheck + test.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> lint"
npm run lint

echo "==> typecheck"
npm run typecheck

echo "==> test"
npm test

echo "==> verify: OK"
