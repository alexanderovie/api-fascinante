# Smoke tests automáticos

Este repositorio incluye el script `scripts/smoke-tests.sh` que ejecuta una serie de *smoke tests* con `curl` y `jq`. Sirve como checklist automatizable para validar que:

- [x] El servidor responde `status: ok` en `/health`
- [x] El endpoint `/v1/me` responde con `{ "message": "auth disabled" }` cuando `ENABLE_AUTH=false`
- [ ] (Opcional) `GET /v1/me` con token de Auth0 devuelve `userId`, `email`, `roles` y `tenant.*`
- [ ] (Opcional) Varias peticiones autenticadas retornan el mismo `tenant.organizationId`
- [ ] (Manual) Las variables de entorno obligatorias (`AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `DATABASE_URL`) fuerzan un error si faltan mientras `ENABLE_AUTH=true`

## Cómo usar el script

1. Instala `jq` si no lo tienes (`sudo apt install jq` o similar).
2. Levanta el backend local (`pnpm dev` o `ts-node src/server.ts`).
3. Ejecuta:

```bash
BASE_URL=http://localhost:8080 ENABLE_AUTH=false ./scripts/smoke-tests.sh
```

4. Si quieres activar los pasos autenticados:

```bash
ENABLE_AUTH=true AUTH_TOKEN=<token_valido> ./scripts/smoke-tests.sh
```

5. Ajusta `REPEAT_REQUESTS` si deseas más iteraciones sobre `/v1/me`.

El script aborta en cualquier fallo y deja un mensaje explicando qué prueba falló; así puedes enlazarlo fácilmente en un pipeline de CI como *smoke test* básico antes de un despliegue.
