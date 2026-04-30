<script setup lang="ts">
import type { User } from '~/services/types'
import BaseCard from '~/components/ui/BaseCard.vue'
import BaseCardList from '~/components/ui/BaseCardList.vue'
import BaseDataTable from '~/components/ui/BaseDataTable.vue'

defineProps<{
  users: User[]
  loggedUserId?: number | null
  modifiedUsers: Record<number, boolean>
}>()

const emit = defineEmits<{
  activeChange: [userId: number, value: boolean]
  save: [user: User]
}>()
</script>

<template>
  <div v-if="users.length" class="users-list">
    <BaseDataTable class="users-list__desktop-table" min-width="62rem">
      <thead>
        <tr>
          <th scope="col">Usuario</th>
          <th scope="col">Email</th>
          <th scope="col">ID</th>
          <th scope="col">Tipo</th>
          <th scope="col">Memberships</th>
          <th scope="col">Creado</th>
          <th scope="col">Activo</th>
          <th class="is-actions-cell" scope="col">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="user in users" :key="user.id">
          <th scope="row">
            <strong>{{ user.username || 'Sin usuario' }}</strong>
          </th>
          <td>{{ user.email || 'No definido' }}</td>
          <td>{{ user.id }}</td>
          <td>
            <span :class="['users-list__badge', user.is_superadmin ? 'is-superadmin' : '']">
              {{ user.is_superadmin ? 'Superadmin' : 'Usuario' }}
            </span>
          </td>
          <td>
            <NuxtLink class="users-list__link" :to="`/users/${user.id}/memberships`">
              Tenant memberships ({{ user.tenants?.length || 0 }})
            </NuxtLink>
          </td>
          <td>{{ user.created_at || 'No definido' }}</td>
          <td>
            <label class="users-list__active">
              <input
                :checked="user.is_active"
                type="checkbox"
                :disabled="user.id === loggedUserId"
                @change="emit('activeChange', user.id, ($event.target as HTMLInputElement).checked)"
              >
              <span>{{ user.is_active ? 'Activo' : 'Inactivo' }}</span>
            </label>
          </td>
          <td class="is-actions-cell">
            <div class="users-list__actions">
              <button
                v-if="modifiedUsers[user.id]"
                type="button"
                @click="emit('save', user)"
              >
                Guardar
              </button>
              <button v-else class="users-list__noop-button" type="button" disabled>
                Sin cambios
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </BaseDataTable>

    <BaseCardList mobile-only>
      <BaseCard v-for="user in users" :key="user.id" class="user-card">
        <div class="user-card__head">
          <div>
            <h2>{{ user.username || 'Sin usuario' }}</h2>
            <p>{{ user.email || 'No definido' }}</p>
          </div>
          <span :class="['users-list__badge', user.is_superadmin ? 'is-superadmin' : '']">
            {{ user.is_superadmin ? 'Superadmin' : 'Usuario' }}
          </span>
        </div>

        <dl>
          <div>
            <dt>ID</dt>
            <dd>{{ user.id }}</dd>
          </div>
          <div>
            <dt>Memberships</dt>
            <dd>
              <NuxtLink class="users-list__link" :to="`/users/${user.id}/memberships`">
                Tenant memberships ({{ user.tenants?.length || 0 }})
              </NuxtLink>
            </dd>
          </div>
          <div>
            <dt>Creado</dt>
            <dd>{{ user.created_at || 'No definido' }}</dd>
          </div>
        </dl>

        <div class="user-card__footer">
          <label class="users-list__active">
            <input
              :checked="user.is_active"
              type="checkbox"
              :disabled="user.id === loggedUserId"
              @change="emit('activeChange', user.id, ($event.target as HTMLInputElement).checked)"
            >
            <span>{{ user.is_active ? 'Activo' : 'Inactivo' }}</span>
          </label>

          <button
            v-if="modifiedUsers[user.id]"
            type="button"
            @click="emit('save', user)"
          >
            Guardar
          </button>
          <button v-else class="users-list__noop-button" type="button" disabled>
            Sin cambios
          </button>
        </div>
      </BaseCard>
    </BaseCardList>
  </div>

  <div v-else class="users-list__empty">
    No hay usuarios para mostrar.
  </div>
</template>

<style scoped>
.users-list {
  min-width: 0;
}

.users-list__desktop-table {
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
}

.users-list__badge {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  background: #e2e8f0;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 800;
}

.users-list__badge.is-superadmin {
  background: #fef3c7;
  color: #92400e;
}

.users-list__link {
  color: #1d4ed8;
  font-weight: 800;
  text-decoration: none;
}

.users-list__link:hover {
  text-decoration: underline;
}

.users-list__active {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.users-list__actions {
  display: flex;
  justify-content: flex-end;
}

.users-list button,
.user-card button {
  border: 0;
  border-radius: 0.65rem;
  padding: 0.55rem 0.75rem;
  background: #1d4ed8;
  color: #ffffff;
  cursor: pointer;
  font-weight: 800;
}

.users-list button.users-list__noop-button,
.user-card button.users-list__noop-button {
  background: #e2e8f0;
  color: #64748b;
  cursor: not-allowed;
}

.users-list button:disabled,
.user-card button:disabled {
  background: #cbd5e1;
  color: #475569;
  cursor: not-allowed;
}

.user-card {
  gap: 0.85rem;
  padding: 1rem;
}

.user-card__head,
.user-card__footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
}

.user-card__head > div {
  min-width: 0;
}

.user-card h2,
.user-card p {
  margin: 0;
}

.user-card h2 {
  color: #1d4ed8;
  font-size: 1.1rem;
}

.user-card p {
  margin-top: 0.25rem;
  color: #475569;
}

.user-card dl {
  display: grid;
  gap: 0.65rem;
  margin: 0;
}

.user-card dl div {
  display: grid;
  gap: 0.18rem;
}

.user-card dt {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
}

.user-card dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.users-list__empty {
  border: 1px dashed #cbd5e1;
  border-radius: 1rem;
  padding: 2rem;
  background: #ffffff;
  color: #64748b;
  text-align: center;
}

@media (max-width: 640px) {
  .users-list__desktop-table {
    display: none;
  }

  .user-card__head {
    flex-wrap: wrap;
  }

  .user-card__footer {
    align-items: stretch;
    flex-direction: column;
  }

  .user-card__footer button {
    width: 100%;
  }
}
</style>
