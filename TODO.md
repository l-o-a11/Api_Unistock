# TODO - Resolución del error "Failed to resolve action download info"

## Contexto

El error `Service Unavailable` en GitHub Actions es transitorio (problema de los servidores de GitHub al resolver/descargar las actions). No es un error de código.

## Pasos

- [x] 1. Analizar el error y verificar que el workflow `playwright.yml` es correcto.
- [x] 2. Confirmar con el usuario el enfoque (reintentar + robustez).
- [x] 3. NO se fijan las actions a SHA: `@v4` es estable y fijar a SHA complica el mantenimiento. El problema transitorio se resuelve con reintento.
- [x] 4. Añadir un paso de reintento (retry) para pasos críticos (npm ci y playwright install).
- [x] 5. Añadir `workflow_dispatch` (ejecución manual) y `concurrency` (evitar corridas duplicadas).
- [x] 6. Verificado: el workflow es YAML válido y compatible con GitHub Actions.
