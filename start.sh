#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "==> Installing dependencies..."
echo "y" | npx pnpm@9 install --force 2>&1 | grep -E "^(Done|ERR)" || true

echo "==> Linking .env..."
ln -sf "$(pwd)/.env" "$(pwd)/apps/api/.env"

echo "==> Setting up database (Neon DB)..."
cd apps/api
npx prisma generate 2>&1 | tail -3

echo ""
echo "  Checking database schema..."
if npx prisma db push 2>&1 | grep -q "already in sync"; then
  echo "  Database schema is up to date."
else
  echo "  Schema updated."
fi

echo ""
echo "  Seeding test data..."
npx prisma db seed 2>&1 | tail -5
cd ../..

echo ""
echo "============================================"
echo "  API:  http://localhost:4000"
echo "  Docs: http://localhost:4000/api/docs"
echo "  Web:  http://localhost:3000"
echo "============================================"
echo ""
echo "  Test accounts:"
echo "    admin@hrshakti.com  (Admin)"
echo "    priya@hrshakti.com  (Moderator)"
echo "    vikram@hrshakti.com (Member)"
echo "    ananya@hrshakti.com (Member)"
echo "    mohan@hrshakti.com  (Member)"
echo ""
echo "==> Starting dev servers (Ctrl+C to stop all)..."
npx pnpm@9 dev
