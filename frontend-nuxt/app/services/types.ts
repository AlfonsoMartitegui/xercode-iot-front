export interface AuthUser {
  id: number
  username?: string
  email?: string
  tenant_id?: number | null
  is_superadmin?: boolean
  [key: string]: unknown
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type?: string
}

export interface BeaverHandoffResponse {
  redirect_url: string
  code: string
}

export interface TenantDomain {
  id: number
  domain: string
  is_primary?: boolean
  [key: string]: unknown
}

export interface Tenant {
  id: number
  name: string
  code: string
  address?: string | null
  redirect_url?: string | null
  beaver_base_url?: string | null
  beaver_admin_username?: string | null
  beaver_admin_password?: string | null
  is_active?: boolean
  domains?: TenantDomain[]
  [key: string]: unknown
}

export interface TenantPayload {
  name: string
  code: string
  address?: string
  redirect_url?: string
  beaver_base_url?: string
  beaver_admin_username?: string
  beaver_admin_password?: string
  is_active: boolean
}

export interface TenantDomainPayload {
  domain: string
  is_primary: boolean
}

export interface User {
  id: number
  username?: string
  email?: string
  is_active?: boolean
  is_superadmin?: boolean
  created_at?: string
  tenants?: Tenant[]
  [key: string]: unknown
}

export interface UserPayload {
  username?: string
  email?: string
  password?: string
  is_active?: boolean
  is_superadmin?: boolean
  [key: string]: unknown
}

export interface UserTenantMembership {
  id?: number
  user_id?: number
  tenant_id: number
  role?: string
  beaver_role_id?: string | number | null
  is_active?: boolean
  [key: string]: unknown
}

export interface UserTenantPayload {
  tenant_id?: number | string
  role?: string
  beaver_role_id?: string | number | null
  is_active?: boolean
}

export interface BeaverRole {
  id?: number | string
  role_id?: number | string
  name?: string
  display_name?: string
  [key: string]: unknown
}
