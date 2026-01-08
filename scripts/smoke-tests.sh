#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
AUTH_TOKEN="${AUTH_TOKEN:-}"
ENABLE_AUTH="${ENABLE_AUTH:-false}"
TIMEOUT="${TIMEOUT:-5}"
REPEAT_REQUESTS="${REPEAT_REQUESTS:-2}"

info() { printf "\n[INFO] %s\n" "$1"; }
success() { printf "[OK] %s\n" "$1"; }
fail() { printf "[ERROR] %s\n" "$1"; exit 1; }

if ! command -v curl >/dev/null; then
  fail "curl no está instalado"
fi

if ! command -v jq >/dev/null; then
  fail "jq no está instalado (se usa para validar respuestas JSON)"
fi

info "Ejecutando smoke tests desde ${BASE_URL}"

{
  response=$(curl -fsS --max-time "$TIMEOUT" "$BASE_URL/health")
  status=$(printf '%s' "$response" | jq -r '.status?')
} || fail "Health check (`/health`) falló"

if [[ "$status" != "ok" ]]; then
  fail "Health check retornó status=$status"
fi
success "Health check válido"

info "Verificando endpoint privado con auth desactivada"
{
  response=$(curl -fsS --max-time "$TIMEOUT" "$BASE_URL/v1/me" || true)
} || true

message=$(printf '%s' "$response" | jq -r '.message?')
if [[ "$message" != "auth disabled" ]]; then
  fail "Ruta privada sin auth debería devolver mensaje 'auth disabled', recibió '$message'"
fi
success "Ruta privada responde con auth desactivada"

if [[ "$ENABLE_AUTH" == "true" ]]; then
  if [[ -z "$AUTH_TOKEN" ]]; then
    fail "ENABLE_AUTH=true pero no se proporcionó AUTH_TOKEN"
  fi

  info "Probando endpoint privado autenticado"
  auth_response=$(curl -fsS --max-time "$TIMEOUT" -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/v1/me")
  user_id=$(printf '%s' "$auth_response" | jq -r '.userId?')
  if [[ -z "$user_id" || "$user_id" == "null" ]]; then
    fail "Respuesta autenticada no incluye userId"
  fi
  success "Autenticación básica validada (userId presente)"

  info "Validando creación/reuso de tenant en ${REPEAT_REQUESTS} peticiones consecutivas"
  last_tenant=""
  for attempt in $(seq 1 "$REPEAT_REQUESTS"); do
    repeat_response=$(curl -fsS --max-time "$TIMEOUT" -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/v1/me")
    tenant_id=$(printf '%s' "$repeat_response" | jq -r '.tenant.organizationId?')
    if [[ -z "$tenant_id" || "$tenant_id" == "null" ]]; then
      fail "Intento $attempt: no se obtuvo tenant.organizationId"
    fi
    if [[ "$attempt" -eq 1 ]]; then
      last_tenant="$tenant_id"
    elif [[ "$tenant_id" != "$last_tenant" ]]; then
      fail "Tenant cambiado entre peticiones consecutivas ($last_tenant ≠ $tenant_id)"
    fi
  done
  success "Tenant consistente tras ${REPEAT_REQUESTS} peticiones"
else
  info "ENABLE_AUTH no activo; pruebas autenticadas omitidas"
fi

success "Todos los smoke tests completados"
