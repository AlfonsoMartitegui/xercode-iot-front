import { useApi } from '~/composables/useApi'
import { getApiErrorMessage } from '~/services/errors'
import type { Tenant, TenantDomain, TenantDomainPayload, TenantPayload } from '~/services/types'

export async function getTenants() {
  const api = useApi()

  try {
    return await api<Tenant[]>('/tenants/')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al obtener tenants'))
  }
}

export async function getTenant(tenantId: number) {
  const api = useApi()

  try {
    return await api<Tenant>(`/tenants/${tenantId}`)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al obtener el tenant'))
  }
}

export async function createTenant(data: TenantPayload) {
  const api = useApi()

  try {
    return await api<Tenant>('/tenants/', {
      method: 'POST',
      body: data,
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al crear tenant'))
  }
}

export async function updateTenant(tenantId: number, data: Partial<TenantPayload>) {
  const api = useApi()

  try {
    return await api<Tenant>(`/tenants/${tenantId}`, {
      method: 'PUT',
      body: data,
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al actualizar tenant'))
  }
}

export async function deleteTenant(tenantId: number) {
  const api = useApi()

  try {
    return await api<unknown>(`/tenants/${tenantId}`, {
      method: 'DELETE',
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al eliminar tenant'))
  }
}

export async function getTenantDomains(tenantId: number) {
  const api = useApi()

  try {
    return await api<TenantDomain[]>(`/tenants/${tenantId}/domains`)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al obtener dominios'))
  }
}

export async function getTenantDomain(tenantId: number, domainId: number) {
  const api = useApi()

  try {
    return await api<TenantDomain>(`/tenants/${tenantId}/domains/${domainId}`)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al obtener el dominio'))
  }
}

export async function createTenantDomain(tenantId: number, data: TenantDomainPayload) {
  const api = useApi()

  try {
    return await api<TenantDomain>(`/tenants/${tenantId}/domains`, {
      method: 'POST',
      body: data,
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al crear el dominio'))
  }
}

export async function updateTenantDomain(tenantId: number, domainId: number, data: TenantDomainPayload) {
  const api = useApi()

  try {
    return await api<TenantDomain>(`/tenants/${tenantId}/domains/${domainId}`, {
      method: 'PUT',
      body: data,
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al actualizar el dominio'))
  }
}

export async function deleteTenantDomain(tenantId: number, domainId: number) {
  const api = useApi()

  try {
    return await api<unknown>(`/tenants/${tenantId}/domains/${domainId}`, {
      method: 'DELETE',
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al eliminar el dominio'))
  }
}
