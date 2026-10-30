---
name: probar-frontend
description: Ejecuta las pruebas E2E del frontend ModoFriki (casos de e2e/flows.md) en un navegador real con el MCP de Playwright, contra el backend de pruebas en Docker, y entrega un reporte de fallos con evidencia. Solo prueba, no modifica código. Usar cuando el usuario pida probar el frontend, correr las pruebas E2E/Playwright, verificar las pantallas o invoque /probar-frontend.
argument-hint: "[casos opcionales: E2E-05 | B | todos]"
---

# Probar el frontend: $ARGUMENTS

Eres el coordinador. La ejecución la hace el subagente `tester-e2e`. **No edites código ni `e2e/flows.md`.**

## 1. Backend de pruebas (tú)
El front necesita el backend del repo hermano. Su ruta es `$MODOFRIKI_BACKEND_DIR` o, por defecto, `../ModoFriki-Backend`. Si no existe, pide la ruta y detente.
1. `docker info` debe responder. Si no, pide al usuario que abra Docker Desktop y detente.
2. Si `docker ps --filter name=modofriki-test-pg --format '{{.Status}}'` no muestra `Up`, ejecuta `npm run test:env:up` en la carpeta del backend.
3. Si `localhost:3000/health` no responde, levanta `npm run test:env:server` (carpeta del backend) **en segundo plano** y espera a que responda. Anota que lo levantaste tú.
4. **Guardia:** `GET localhost:3000/api/works/66666666-6666-4666-8666-666666666666` debe dar 200. Si da otra cosa, el `:3000` no es el backend de pruebas: **detente** y pide al usuario que lo detenga.

## 2. Front en modo e2e (tú)
- Si `localhost:5173` no responde, ejecuta `npm install` si falta `node_modules` y levanta `npm run dev:e2e` **en segundo plano** (usa `.env.e2e` → `http://localhost:3000/api`). Anota que lo levantaste tú.
- Si ya responde, podría ser un `npm run dev` apuntando a otro backend. Confírmalo: la home debe mostrar "Obra de Prueba". Si no la muestra, pide al usuario que lo detenga.

## 3. Ejecutar → `tester-e2e`
Pásale los casos pedidos (`$ARGUMENTS`, o "todos").
Si el MCP `playwright` no está disponible, no lo reemplaces con otra herramienta: pide al usuario que lo active con `/mcp` (el servidor está en `.mcp.json`) y detente.

## 4. Cerrar
- Detén lo que levantaste tú (front y backend). Los contenedores de Docker se quedan; `npm run test:env:down` en el backend los borra.
- Muestra el reporte del tester, más una línea final:
  - Sin fallos → "Todo OK".
  - Con fallos → "Para corregirlos: `/corregir-frontend`" (y `/corregir-backend` en el repo del backend si hay fallos 🔌).
- Nunca digas que algo pasó si no se ejecutó.
