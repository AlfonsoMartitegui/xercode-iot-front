# Beaver Frontend Alignment Runbook

## Objetivo

Alinear el frontend con la preparacion backend para integracion Beaver sin asumir que ya existe sincronizacion real con Beaver.

En esta fase el HUB sigue siendo la fuente de verdad. El frontend solo debe permitir guardar configuracion, credenciales tecnicas y mapeos en el HUB.

## Fuera de alcance

- No implementar provisioning real contra Beaver.
- No mostrar estados de sync, retries, jobs o errores de sincronizacion Beaver.
- No crear ni guardar passwords Beaver por usuario.
- No crear ni guardar passwords Beaver por membresia usuario-tenant.
- No mostrar ni intentar leer `beaver_admin_password` ni `beaver_admin_password_encrypted`.
- No usar textos que sugieran que Beaver ya esta sincronizado.

## Contratos backend relevantes

### Tenant

Campos recibidos en lectura:

- `id`
- `code`
- `name`
- `address`
- `redirect_url`
- `beaver_base_url`
- `beaver_admin_username`
- `is_active`
- `domains`

Campos aceptados en create/update:

- `code`
- `name`
- `address`
- `redirect_url`
- `beaver_base_url`
- `beaver_admin_username`
- `beaver_admin_password`
- `is_active`

Notas:

- `beaver_admin_password` es write-only.
- En edicion, enviar `beaver_admin_password` solo si el usuario quiere setear o resetear la password.
- Si el campo password queda vacio, no debe enviarse o debe enviarse vacio solo si el backend conserva el valor actual.

### User

Campos clave:

- `username` es unico global.
- `email` es obligatorio.
- `email` es unico global.

Notas:

- El flujo actual de usuarios en `auth.py` se mantiene.
- No hace falta redisenar toda la creacion de usuarios en el primer paso.
- Si el backend devuelve error por email duplicado, el frontend debe mostrarlo de forma clara.

### UserTenant

Campos de una membresia:

- `user_id`
- `tenant_id`
- `role`
- `beaver_role_id`
- `is_active`

Endpoints:

- `GET /users/{user_id}/tenants`
- `POST /users/{user_id}/tenants`
- `PUT /users/{user_id}/tenants/{tenant_id}`
- `DELETE /users/{user_id}/tenants/{tenant_id}`

Payload create:

```json
{
  "tenant_id": 1,
  "role": "user",
  "beaver_role_id": "optional-beaver-role-id",
  "is_active": true
}
```

Payload update:

```json
{
  "role": "admin",
  "beaver_role_id": "optional-beaver-role-id",
  "is_active": true
}
```

### Beaver Roles Lookup

Endpoint ya disponible en HUB:

- `GET /tenants/{tenant_id}/beaver/roles`

Comportamiento:

- solo superadmin
- el frontend llama al HUB, no a Beaver
- el HUB autentica tecnicamente contra Beaver con las credenciales del tenant
- el HUB consulta roles Beaver y devuelve una respuesta simple para frontend

Respuesta actual:

```json
[
  {
    "role_id": "2047360102588059650",
    "name": "user"
  },
  {
    "role_id": "1",
    "name": "super_admin"
  }
]
```

Notas:

- Para frontend, lo importante es seleccionar por `name` y guardar `role_id` en `beaver_role_id`.
- `created_at` existe en la respuesta nativa de Beaver, pero no forma parte del contrato simplificado actual del HUB y no es necesario para la seleccion.

## Fase 1: Alinear Tenants Con Configuracion Beaver

Objetivo: permitir que el superadmin configure los datos tecnicos Beaver por tenant sin insinuar sincronizacion real.

Archivos probables:

- `src/pages/Tenants.js`
- `src/api/tenants.js`

Acciones:

- Extender el estado del formulario de tenant con `beaver_admin_username` y `beaver_admin_password`.
- Mantener `beaver_base_url` como Beaver backend URL.
- Anadir una seccion visual tipo `Beaver integration` o `Configuracion Beaver`.
- En create, permitir rellenar URL, username y password.
- En edit, precargar `beaver_base_url` y `beaver_admin_username`.
- En edit, dejar `beaver_admin_password` siempre vacio.
- Mostrar ayuda en password: `Leave blank to keep current password` o equivalente en espanol.
- No mostrar password actual ni password cifrada.
- Enviar `beaver_admin_password` solo cuando tenga valor.
- Mostrar en la tarjeta/listado el `beaver_admin_username` si existe.

Criterios de aceptacion:

- Crear tenant permite guardar credenciales tecnicas Beaver.
- Editar tenant permite cambiar URL y username.
- Editar tenant permite resetear password escribiendo una nueva.
- Editar tenant no muestra ni recupera la password actual.
- El copy de UI no habla de sync, provisioning ni estado Beaver.

Verificacion recomendada:

- Crear tenant con `beaver_base_url`, `beaver_admin_username` y `beaver_admin_password`.
- Editar tenant cambiando solo `beaver_base_url`; confirmar que no se rompe la password existente.
- Editar tenant escribiendo nueva `beaver_admin_password`; confirmar que el backend acepta el update.
- Revisar respuesta API y confirmar que nunca aparece password ni version cifrada.

## Fase 2: Alinear Usuarios Y Validacion De Email

Objetivo: reforzar el formulario actual de usuario para el nuevo requisito de email obligatorio y unico.

Archivos probables:

- `src/pages/Users.js`
- `src/api/createUser.js`
- `src/api/editUser.js`
- `src/api/user.js`

Acciones:

- Mantener `email` como campo required en creacion.
- Revisar que edicion de usuario no pueda dejar `email` vacio si se expone edicion de email.
- Mostrar errores de backend por email duplicado de forma clara.
- Si el backend devuelve errores de integridad poco amigables, normalizarlos en el cliente de API o en la pantalla.
- No cambiar radicalmente el flujo `auth.py` en esta fase.

Criterios de aceptacion:

- No se puede crear usuario sin email.
- Un email duplicado se comunica al usuario como conflicto de email.
- El formulario mantiene compatibilidad con el flujo actual de backend.

Verificacion recomendada:

- Crear usuario con email valido.
- Intentar crear otro usuario con el mismo email.
- Editar usuario manteniendo email existente.
- Confirmar que los errores se muestran en el modal y no rompen la pantalla.

## Fase 3: Gestionar Membresias Usuario-Tenant

Objetivo: representar la entidad explicita `UserTenant` en la UI y permitir administrar rol HUB, mapeo Beaver y activacion por tenant.

Archivos probables:

- `src/pages/Users.js`
- Nuevo cliente API sugerido: `src/api/userTenants.js`

Acciones:

- Crear funciones API:
  - `getUserTenants(token, userId)`
  - `createUserTenant(token, userId, data)`
  - `updateUserTenant(token, userId, tenantId, data)`
  - `deleteUserTenant(token, userId, tenantId)`
- Anadir una seccion `Tenant memberships` en detalle/edicion de usuario.
- Listar membresias del usuario usando `GET /users/{user_id}/tenants`.
- Permitir anadir tenant con `tenant_id`, `role`, `beaver_role_id` e `is_active`.
- Permitir editar por membresia:
  - `role`
  - `beaver_role_id`
  - `is_active`
- Permitir borrar membresia.
- Mantener claro que `beaver_role_id` es un mapeo tecnico almacenado en HUB y usado despues en provisioning Beaver.
- No anadir password Beaver por usuario o membresia.

Criterios de aceptacion:

- Un superadmin puede ver las membresias reales de un usuario.
- Un superadmin puede anadir una membresia con rol HUB y mapeo Beaver opcional.
- Un superadmin puede editar `role`, `beaver_role_id` e `is_active`.
- Un superadmin puede eliminar una membresia.
- La UI no sugiere que se haya creado, actualizado o sincronizado nada en Beaver.

Verificacion recomendada:

- Abrir un usuario y cargar sus membresias.
- Crear una membresia nueva.
- Editar `role` y `beaver_role_id`.
- Desactivar una membresia.
- Borrar una membresia.
- Recargar la pantalla y confirmar persistencia.

## Fase 4: Sustituir Beaver Role Libre Por Dropdown Desde HUB

Objetivo: dejar de pedir `beaver_role_id` manual y seleccionar un rol Beaver valido por tenant usando el endpoint del HUB.

Contexto:

- Esta fase pasa a ser obligatoria si `beaver_role_id` es necesario para el provisioning posterior en Beaver.
- El frontend ya no debe usar input de texto libre para `beaver_role_id`.
- El backend ya expone `GET /tenants/{tenant_id}/beaver/roles`.

Archivos probables:

- `src/pages/Users.js`
- `src/api/userTenants.js`
- Opcional nuevo cliente dedicado: `src/api/beaverRoles.js`

Acciones:

- Crear cliente API para consultar:
  - `getTenantBeaverRoles(token, tenantId)`
- Sustituir el input libre de `beaver_role_id` por un `select` o dropdown.
- Cargar roles Beaver segun el tenant de la membresia.
- Mostrar al usuario el `name` del rol Beaver.
- Guardar en payload el `role_id` seleccionado dentro de `beaver_role_id`.
- Al cambiar de tenant en el alta de membresia:
  - limpiar el rol Beaver seleccionado
  - volver a consultar el catalogo de roles de ese tenant
- En edicion de membresia existente:
  - cargar los roles Beaver del tenant correspondiente
  - seleccionar el `beaver_role_id` actual si existe en la lista
- No permitir escritura libre de `beaver_role_id`.
- Mantener mensajes claros si faltan credenciales Beaver o si no se pueden recuperar roles para ese tenant.

Criterios de aceptacion:

- El alta de membresia no usa input libre para `beaver_role_id`.
- El usuario puede seleccionar un rol Beaver por nombre.
- El valor enviado al backend sigue siendo `beaver_role_id = role_id`.
- Cambiar el tenant limpia el rol Beaver seleccionado.
- Si el endpoint devuelve lista vacia, la UI informa que no hay roles disponibles.
- Si el endpoint falla, la UI muestra un error entendible.

Verificacion recomendada:

- Seleccionar tenant en alta de membresia y comprobar que se cargan roles Beaver.
- Elegir un rol por nombre y guardar la membresia.
- Editar una membresia existente y confirmar que el rol actual aparece seleccionado.
- Cambiar tenant y comprobar que el rol Beaver previo se limpia.
- Simular tenant sin configuracion Beaver o error del endpoint y revisar mensajes.

## Orden recomendado

1. Fase 1: Tenants con configuracion Beaver.
2. Fase 2: Usuarios y email unico.
3. Fase 3: Membresias usuario-tenant.
4. Fase 4: Beaver roles por dropdown desde HUB.

La Fase 3 cambia la manera en que la UI entiende la relacion usuario-tenant. La Fase 4 cierra el contrato correcto para `beaver_role_id` y es necesaria si ese dato sera obligatorio en provisioning Beaver.

## Riesgos y decisiones pendientes

- Decidir si `beaver_admin_password` vacio debe omitirse del payload o enviarse como string vacio. Recomendado: omitirlo para evitar ambiguedad.
- Decidir catalogo cerrado o texto libre para `role`. El backend acepta string; la UI podria empezar con opciones simples como `user` y `admin`.
- Decidir si la creacion rapida de usuario mantiene `tenant_ids` o si se migra a crear usuario primero y luego membresias.
- Coordinar con backend mensajes amigables para email duplicado si ahora llegan como error generico de base de datos.
- Definir si la UI debe exigir `beaver_role_id` siempre o solo cuando el flujo de negocio realmente vaya a provisionar en Beaver.

## Lenguaje recomendado en UI

Usar:

- `Configuracion Beaver`
- `Beaver backend URL`
- `Usuario admin Beaver`
- `Password admin Beaver`
- `Mapeo rol Beaver`
- `Rol Beaver`
- `Guardado en HUB`
- `Preparado para integracion`

Evitar:

- `Sincronizar con Beaver`
- `Provisionar usuario`
- `Estado de sync`
- `Retry Beaver`
- `Usuario creado en Beaver`
- `Credenciales sincronizadas`
