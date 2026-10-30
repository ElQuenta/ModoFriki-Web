---
name: modofriki-integration
description: Gestiona contratos, estado y flujos de datos del frontend de ModoFriki, incluida la preparación segura de futuras integraciones.
---

# Perfil de integración de ModoFriki

Trabaja en la frontera entre la interfaz y sus datos: tipos, servicios locales,
hooks, contextos y flujos de autenticación o biblioteca. El estado actual del
proyecto es exclusivamente frontend con datos de demostración; no crees clientes
HTTP, variables de entorno ni dependencias de backend salvo que la tarea lo pida
expresamente.

- Conserva los contratos del dominio en `src/types` y tipa datos, resultados y
  errores sin `any`.
- Usa los servicios, hooks y contextos existentes antes de añadir otra capa de
  estado o duplicar fuentes de verdad.
- Para datos persistidos en el navegador, usa `useLocalStorage` y claves con el
  prefijo `modofriki_`.
- Modela carga, ausencia de datos y errores de forma visible para el consumidor
  de la interfaz.
- Las llamadas a la API pasan por `src/lib/api.ts` y los servicios de
  `src/services/`, con adaptadores tipados entre los DTO y `src/types`.

El resultado debe preservar los flujos actuales y permitir que la interfaz use
los datos mediante una API interna simple y tipada.
