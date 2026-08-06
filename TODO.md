# TODO - Resolución del error "Failed to resolve action download info"

## Contexto

1. El error `Service Unavailable` en GitHub Actions es transitorio (problema de los servidores de GitHub al resolver/descargar las actions). No es un error de código.
2. Después de resolver el error transitorio, el workflow fallaba con "No tests found" porque los tests de Playwright fueron eliminados en el commit "eliminacion de K6" (commit 0cdbbcd).

## Pasos

- [x] 1. Analizar el error y verificar que el workflow `playwright.yml` es correcto.
- [x] 2. Confirmar con el usuario el enfoque (reintentar + robustez).
- [x] 3. NO se fijan las actions a SHA: `@v4` es estable y fijar a SHA complica el mantenimiento. El problema transitorio se resuelve con reintento.
- [x] 4. Añadir un paso de reintento (retry) para pasos críticos (npm ci y playwright install).
- [x] 5. Añadir `workflow_dispatch` (ejecución manual) y `concurrency` (evitar corridas duplicadas).
- [x] 6. Verificado: el workflow es YAML válido y compatible con GitHub Actions.
- [x] 7. Diagnosticar fallo "No tests found": los tests fueron eliminados (commit 0cdbbcd), el workflow aún los ejecutaba.
- [x] 8. Eliminar el paso de tests y el job de Playwright del workflow (decisión del usuario: se elimina el workflow completo porque su único propósito era ejecutar Playwright).
