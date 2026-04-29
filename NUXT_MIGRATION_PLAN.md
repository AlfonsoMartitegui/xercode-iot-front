# Plan De Migracion A Nuxt

## Estado Actual

- [x] Fases 1-11 completadas dentro de `frontend-nuxt/`.
- [~] Fase 12 en validacion funcional manual contra backend real.
- [x] Build Nuxt verificada con `npm run build`.
- [x] Proyecto React original conservado como referencia de lectura.
- [!] Fase 13 descartada para este repo: no se borra, archiva ni modifica el proyecto React original.

Notas de implementacion:

- Algunas piezas previstas como componentes separados quedaron consolidadas cuando era mas simple mantenerlas juntas sin perder claridad funcional.
- `pages/login.vue` contiene el formulario de login en la pagina en vez de separar `components/auth/LoginForm.vue`.
- `TenantDomainsList.vue` quedo integrado en `TenantCard.vue`.
- `UserRow.vue` y `UserMembershipForm.vue` quedaron integrados en `UserCard.vue` y `UserMembershipsPanel.vue`.
- La configuracion Nuxt usa `APP_API_URL` en `frontend-nuxt/.env`; el React mantiene su propio `REACT_APP_API_URL`.

## Esqueleto

Propuesta de destino para `frontend-nuxt/` dentro del repo actual:

```text
frontend-nuxt/
  app/
    app.vue
  nuxt.config.ts
  package.json
  tsconfig.json
  public/
  assets/
    css/
      main.css
      reset.css
      tokens.css
      layout.css
      forms.css
      tables.css
  pages/
    login.vue
    dashboard.vue
    users/
      index.vue
    tenants/
      index.vue
  layouts/
    default.vue
    authenticated.vue
  middleware/
    auth.ts
    guest.ts
    superadmin.ts
  composables/
    useAuth.ts
    useApi.ts
    useNotifications.ts
  services/
    auth.service.ts
    users.service.ts
    tenants.service.ts
    beaver.service.ts
    errors.ts
    types.ts
  components/
    ui/
      BaseButton.vue
      BaseInput.vue
      BaseCheckbox.vue
      BaseModal.vue
      BaseAlert.vue
      BaseCard.vue
      BaseSpinner.vue
    layout/
      AppSidebar.vue
      AppHeader.vue
    auth/
      LoginForm.vue
    tenants/
      TenantList.vue
      TenantCard.vue
      TenantFormModal.vue
      TenantDomainModal.vue
      TenantDomainsList.vue
    users/
      UsersToolbar.vue
      UsersTable.vue
      UserRow.vue
      UserFormModal.vue
      UserMembershipsPanel.vue
      UserMembershipForm.vue
      BeaverPasswordModal.vue
  utils/
    storage.ts
    constants.ts
    guards.ts
```

## Papel De Cada Bloque

- `pages/`: rutas reales de Nuxt.
- `layouts/authenticated.vue`: shell privada con sidebar y contenido.
- `middleware/`: proteccion de rutas y control de acceso.
- `composables/useAuth.ts`: estado compartido con `useState("auth:user")` y `useState("auth:token")`.
- `composables/useApi.ts`: cliente comun sobre `$fetch` con base URL, token y parseo de errores.
- `useState` de Nuxt: fuente de verdad compartida para auth y estado global ligero, sin meter Pinia.
- `services/`: equivalente de `src/api/*`, pero apoyado en `fetch` nativo de Nuxt en vez de `axios`.
- `components/ui/`: piezas visuales propias para no depender de Tailwind ni Bootstrap.
- `assets/css/`: CSS global propio y tokens de diseno.
- `utils/storage.ts`: lectura/escritura segura de `localStorage`.

## Desglose Por Fases

### 1. Arranque De Nuxt - Hecho

Crear `frontend-nuxt/` y dejar funcionando:

- `app/app.vue`
- `nuxt.config.ts`
- `assets/css/main.css`
- estructura base de carpetas

Resultado:

- app Nuxt levanta en local
- CSS propio conectado
- sin logica todavia

### 2. Base Visual Minima De Soporte - Hecho

Crear:

- `layouts/default.vue`
- `layouts/authenticated.vue`
- `components/ui/BaseButton.vue`
- `components/ui/BaseInput.vue`
- `components/ui/BaseModal.vue`
- `components/layout/AppSidebar.vue`

Resultado:

- solo dejamos el soporte visual imprescindible para no bloquear auth y navegacion
- el refinado visual se puede cerrar despues del flujo funcional

### 3. Modelo De Auth - Hecho

Crear:

- `composables/useAuth.ts`
- `utils/storage.ts`
- `services/auth.service.ts`
- `middleware/auth.ts`
- `middleware/guest.ts`
- opcional `middleware/superadmin.ts`

Responsabilidades:

- login
- logout
- hydrate desde `localStorage`
- `getMe`
- compartir `user/token` con `useState`
- mantener cualquier flag global pequeno con `useState` en lugar de store externa

Resultado:

- sesion modelada en Nuxt sin Pinia
- fase prioritaria para desbloquear middleware, login y servicios

### 4. Capa API Comun - Hecho

Crear:

- `composables/useApi.ts`
- `services/errors.ts`
- `services/types.ts`

Y portar logica comun:

- `API_URL`
- auth headers
- parseo de errores
- tipos base de respuesta
- wrapper comun con `$fetch`

Resultado:

- dejamos resuelto el patron tecnico antes de migrar pantallas
- evitamos introducir `axios` si Nuxt ya resuelve SSR, interceptores ligeros y serializacion con `ofetch`

### 5. Login - Hecho

Crear:

- `pages/login.vue`
- `components/auth/LoginForm.vue`

Portar logica de:

- `src/pages/Login.js`
- `src/api/auth.js`
- `src/api/user.js`
- `src/api/beaverHandoff.js`

Resultado:

- login funcional
- bifurcacion superadmin vs Beaver handoff
- nota: `LoginForm.vue` no se creo como componente separado; la logica quedo en `pages/login.vue`.

### 6. Layout Autenticado Y Dashboard - Hecho

Crear:

- `pages/dashboard.vue`
- `layouts/authenticated.vue`
- `components/layout/AppHeader.vue`
- `middleware/auth.ts` aplicado a rutas privadas

Aqui sustituimos el `Dashboard.js` actual como contenedor booleano por navegacion real.

Resultado:

- zona privada navegable
- sidebar estable
- landing de superadmin

### 7. Servicios De Tenants - Hecho

Crear:

- `services/tenants.service.ts`

Portar logica de:

- `src/api/tenants.js`

Separar metodos:

- `getTenants`
- `getTenant`
- `createTenant`
- `updateTenant`
- `deleteTenant`
- `getTenantDomain`
- `createTenantDomain`
- `updateTenantDomain`
- `deleteTenantDomain`

Resultado:

- backend de tenants listo antes de la UI

### 8. Modulo Tenants - Hecho

Crear:

- `pages/tenants/index.vue`
- `components/tenants/TenantList.vue`
- `components/tenants/TenantCard.vue`
- `components/tenants/TenantFormModal.vue`
- `components/tenants/TenantDomainModal.vue`
- `components/tenants/TenantDomainsList.vue`

Portar desde:

- `src/pages/Tenants.js`

Division recomendada:

- pagina: carga principal y coordinacion
- lista/card: render
- modal tenant: formulario alta/edicion
- modal dominio: formulario dominio

Resultado:

- primer modulo grande ya migrado
- patron base validado
- nota: la lista de dominios quedo integrada en `TenantCard.vue`.

### 9. Servicios De Users Y Beaver - Hecho

Crear:

- `services/users.service.ts`
- `services/beaver.service.ts`

Portar logica de:

- `src/api/user.js`
- `src/api/createUser.js`
- `src/api/editUser.js`
- `src/api/userTenants.js`
- `src/api/beaverRoles.js`
- `src/api/beaverPassword.js`
- `src/api/beaverProvision.js`

Resultado:

- toda la logica backend de usuarios lista y separada

### 10. Modulo Users - Hecho

Crear:

- `pages/users/index.vue`
- `components/users/UsersToolbar.vue`
- `components/users/UsersTable.vue`
- `components/users/UserRow.vue`
- `components/users/UserFormModal.vue`
- `components/users/UserMembershipsPanel.vue`
- `components/users/UserMembershipForm.vue`
- `components/users/BeaverPasswordModal.vue`

Portar desde:

- `src/pages/Users.js`

Separacion funcional:

- toolbar: filtros y acciones globales
- tabla/listado: usuarios
- modal alta: crear usuario
- memberships panel: editar memberships
- password modal: Beaver actions

Resultado:

- modulo mas complejo migrado de forma mantenible
- nota: `UserRow.vue` y `UserMembershipForm.vue` quedaron integrados en componentes mayores para evitar fragmentacion prematura.

### 11. Mensajes Y Estados - Hecho

Crear o reforzar:

- `composables/useNotifications.ts`
- `components/ui/BaseAlert.vue`
- `components/ui/BaseSpinner.vue`

Objetivo:

- no mezclar `error` con mensajes de exito
- homogeneizar `loading/error/success`
- evitar dispersion que ahora existe en `Users.js`

Resultado:

- UX y estado mas limpios que en React

### 12. Ajuste Fino Y Validacion - En curso

Revisar flujos:

- login superadmin
- login no superadmin
- CRUD tenants
- dominios
- CRUD users
- memberships
- Beaver roles
- provisionado y cambio de password

Resultado:

- paridad funcional con el React actual
- estado: pendiente de confirmacion manual con `npm run dev` y backend real.

### 13. Retirada Del React - No aplica en este repo

Decision actual:

- no eliminar `src/`
- no archivar ni modificar el proyecto React original
- mantener React como referencia y fallback mientras se valida Nuxt
- cualquier ajuste final debe ocurrir dentro de `frontend-nuxt/`

## Mapeo Archivo Actual A Destino Nuxt

- `src/index.js` -> `app/app.vue` + `layouts/`
- `src/App.js` -> `pages/` + `layouts/`
- `src/pages/Login.js` -> `pages/login.vue`
- `src/pages/Dashboard.js` -> `layouts/authenticated.vue` + `pages/dashboard.vue`
- `src/pages/Tenants.js` -> `pages/tenants/index.vue` + `components/tenants/*`
- `src/pages/Users.js` -> `pages/users/index.vue` + `components/users/*`
- `src/api/errors.js` -> `services/errors.ts`
- `src/api/auth.js` -> `services/auth.service.ts`
- `src/api/user.js` -> `services/users.service.ts` y parte de `auth.service.ts`
- `src/api/tenants.js` -> `services/tenants.service.ts`
- `src/api/userTenants.js` -> `services/users.service.ts`
- `src/api/beaver*.js` -> `services/beaver.service.ts`

## Orden Recomendado Real

1. crear `frontend-nuxt/`
2. levantar Nuxt con CSS propio
3. modelar auth con `useState`
4. montar middleware y layout privado minimo
5. portar servicios base y `useApi`
6. hacer login
7. volver a la base visual minima y consolidar UI reusable
8. hacer tenants
9. hacer users
10. limpiar estados/mensajes
11. validar Nuxt sin tocar React

## Prioridad De Ejecucion

Aunque el documento enumera primero la base visual minima, conviene ejecutar antes el bloque funcional.

Orden practico recomendado:

1. `Modelo De Auth`
2. `Capa API Comun`
3. `Login`
4. `Layout autenticado` minimo
5. `Base visual minima` ya sin urgencias funcionales

## Recomendacion Practica

Si quieres que la migracion vaya suave, `Tenants` deberia ser el primer modulo funcional completo en Nuxt, no `Users`. `Users` es claramente el bloque con mas riesgo y nos conviene llegar a el con patrones ya probados.

## Decision Tecnica: No Usar Axios

Propongo no anadir `axios` en `frontend-nuxt/`.

Motivos:

- Nuxt ya incluye `fetch` mejorado mediante `ofetch` y expone `$fetch`, `useFetch` y `useAsyncData`.
- reducimos dependencias y evitamos mantener un plugin extra solo para algo que Nuxt ya resuelve bien.
- `runtimeConfig.public.apiUrl` ya encaja de forma natural con un wrapper propio en `useApi.ts`.
- para servicios tipados, `await $fetch<T>(...)` cubre el caso principal sin sobrecarga adicional.

Patron recomendado:

- `useFetch`: para carga reactiva en paginas/componentes cuando interesa estado SSR, `pending` y `error`.
- `$fetch`: para acciones imperativas como login, CRUD, modales y submits.
- `useApi.ts`: composable comun que anada `baseURL`, `Authorization`, `onResponseError` y normalizacion de errores.

Esqueleto sugerido de `useApi.ts`:

```ts
export function useApi() {
  const config = useRuntimeConfig()
  const token = useState<string | null>('auth:token')

  return $fetch.create({
    baseURL: config.public.apiUrl,
    onRequest({ options }) {
      if (token.value) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Bearer ${token.value}`)
      }
    },
    async onResponseError({ response }) {
      throw normalizeApiError(response)
    },
  })
}
```

Consecuencia sobre el plan:

- eliminar `plugins/axios.ts`
- no anadir `axios` al `package.json`
- modelar todos los `services/*.service.ts` sobre una instancia creada con `$fetch.create(...)`

## Decision Tecnica: No Usar Pinia

Propongo no anadir Pinia en esta migracion.

Motivos:

- Nuxt ya nos da `useState`, que comparte estado entre componentes y a nivel app sin configuracion extra.
- para este proyecto, el estado global principal es acotado: sesion, usuario autenticado, token, notificaciones y algunos flags de UI.
- evitamos otra capa conceptual y reducimos boilerplate de stores, acciones y wiring.
- el plan ya esta orientado a composables (`useAuth`, `useApi`, `useNotifications`), y eso encaja mejor con un estado ligero.

Patron recomendado:

- `useState`: auth, usuario actual, token, notificaciones y flags globales pequenos.
- `useAsyncData` o `useFetch`: datos de pagina y carga remota que no necesitan quedarse como store global.
- composables: concentrar acciones y reglas de negocio, dejando el estado compartido en claves de `useState`.

Cuando si reevaluarlo:

- si aparecen muchos modulos con estado global muy acoplado entre si
- si necesitamos herramientas avanzadas de store como plugins, devtools especificas o modelos de mutacion mas complejos

Consecuencia sobre el plan:

- no anadir `pinia` como dependencia de trabajo
- no crear carpeta `stores/` por ahora
- centralizar sesion y estado global ligero en `composables/useAuth.ts` y `composables/useNotifications.ts`
