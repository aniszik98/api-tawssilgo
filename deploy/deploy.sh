#!/usr/bin/env bash
# Déploiement de l'API sur le VPS Hostinger (variante PM2).
# Usage : ./deploy/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Récupération des changements depuis GitHub"
git pull --ff-only

echo "==> Installation des dépendances"
npm ci

echo "==> Build"
npm run build

echo "==> Redémarrage de l'API via PM2"
mkdir -p logs
pm2 reload ecosystem.config.cjs --update-env
pm2 save

echo "==> Terminé"
pm2 status
