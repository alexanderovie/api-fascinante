#!/usr/bin/env bash
set -euo pipefail

PROJECT="${PROJECT:-fd-platform-dev}"
LIMIT="${LIMIT:-2}"

echo "Recuperando los últimos ${LIMIT} builds de Cloud Build en el proyecto ${PROJECT}..."
BUILD_IDS=$(gcloud builds list \
  --project="$PROJECT" \
  --sort-by=~createTime \
  --limit="$LIMIT" \
  --format="value(id)")

if [[ -z "$BUILD_IDS" ]]; then
  echo "No se encontraron builds."
  exit 0
fi

for id in $BUILD_IDS; do
  echo
  echo "============================================================"
  echo "Logs del build $id"
  echo "------------------------------------------------------------"
  gcloud builds log "$id" --project="$PROJECT"
done
