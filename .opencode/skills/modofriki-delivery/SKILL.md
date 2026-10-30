---
name: modofriki-delivery
description: Flujo de entrega de ModoFriki-Web. Úsalo al cerrar un paso del plan, verificar el proyecto o preparar commits. Define la definición de terminado, el formato de commits y la prohibición de hacer push.
---

# ModoFriki Delivery

## Regla principal

Trabaja en la rama actual del repositorio. Si el usuario pide cambiar de rama,
hazlo solo cuando lo indique. **Nunca ejecutes `git push`**; el push lo hace el
usuario manualmente.

## Al terminar cada paso

1. Revisa el diff con `git status --short` y `git diff --stat`.
2. Ejecuta `npm run build`.
3. Ejecuta `npm run lint`.
4. Ejecuta `npm run test:run`.
5. Corrige cualquier error antes de commitear.
6. Haz un commit convencional.

## Formato de commits

```text
tipo(alcance): descripción breve en español
```

Tipos permitidos: `feat`, `fix`, `style`, `refactor`, `chore`, `docs`, `test`.

Ejemplos:

```text
chore(setup): preparar base, skills y hooks del proyecto
feat(ui): crear sistema de diseño negro y naranja
feat(layout): implementar shell y navegación
feat(home): diseñar portada y secciones principales
```

## Prohibiciones

- No hacer push.
- No modificar el proyecto `ModoFriki-Backend`.
- No commitear `node_modules`, `dist` ni archivos `.env` reales.
- No añadir dependencias ni cambios de infraestructura que no correspondan al paso actual.

## Definición de terminado

- La aplicación compila.
- El lint pasa.
- Los tests pasan.
- La pantalla es responsive.
- No hay errores en consola.
- El cambio corresponde al paso actual del plan.
