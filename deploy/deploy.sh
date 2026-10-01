#!/usr/bin/env bash
# Deploiement de l'API TawssilGo sur le VPS Hostinger (variante Docker).
# Usage : bash deploy/deploy.sh
#
# Enchainement : git pull -> build -> redemarrage -> attente du healthcheck.
# Le .env n'est JAMAIS touche par ce script (il est hors git).
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "ERREUR : .env introuvable. Lance d'abord : cp .env.example .env puis remplis-le." >&2
  exit 1
fi

echo "==> Recuperation des changements depuis GitHub"
git pull --ff-only
SHA="$(git rev-parse --short HEAD)"

echo "==> Build de l'image ($SHA)"
docker compose build

# L'image est aussi taguee avec le commit : c'est ce qui permet de revenir
# en arriere meme apres un redemarrage.
docker tag tawssilgo-api:latest "tawssilgo-api:$SHA"

echo "==> Demarrage du conteneur"
docker compose up -d

echo "==> Attente du healthcheck (60 s max)"
for i in $(seq 1 30); do
  status="$(docker inspect --format '{{.State.Health.Status}}' tawssilgo-api 2>/dev/null || echo 'starting')"
  case "$status" in
    healthy)
      echo "    API saine."
      break
      ;;
    unhealthy)
      echo "ERREUR : le conteneur est 'unhealthy'. Logs :" >&2
      docker compose logs --tail=50 >&2
      exit 1
      ;;
  esac
  if [ "$i" -eq 30 ]; then
    echo "ERREUR : l'API ne repond toujours pas apres 60 s. Logs :" >&2
    docker compose logs --tail=50 >&2
    exit 1
  fi
  sleep 2
done

# Nettoyage des couches orphelines uniquement. Les images taguees par commit
# sont conservees : c'est le point de rollback.
echo "==> Nettoyage des couches orphelines"
docker images -f dangling=true -q | xargs -r docker rmi >/dev/null

echo "==> Termine ($SHA)"
docker compose ps
echo
echo "Verification : curl -H 'x-api-key: <CLE>' http://127.0.0.1:3000/api/v1/partenaires?limit=1"
echo
echo "Rollback :"
echo "  git checkout <sha-precedent> && bash deploy/deploy.sh"
echo "Nettoyage manuel des anciens tags (une fois le rollback inutile) :"
echo "  docker images tawssilgo-api --format '{{.Repository}}:{{.Tag}}  {{.CreatedAt}}'"