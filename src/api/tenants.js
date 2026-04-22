import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:6701";

function getAuthHeaders(token) {
  return {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getTenants(token) {
  try {
    const response = await axios.get(`${API_URL}/tenants/`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al obtener tenants";
  }
}

export async function getTenant(token, tenantId) {
  try {
    const response = await axios.get(`${API_URL}/tenants/${tenantId}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al obtener el tenant";
  }
}

export async function createTenant(token, data) {
  try {
    const response = await axios.post(`${API_URL}/tenants/`, data, {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al crear tenant";
  }
}

export async function updateTenant(token, tenantId, data) {
  try {
    const response = await axios.put(`${API_URL}/tenants/${tenantId}`, data, {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al actualizar tenant";
  }
}

export async function deleteTenant(token, tenantId) {
  try {
    const response = await axios.delete(`${API_URL}/tenants/${tenantId}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al eliminar tenant";
  }
}

export async function getTenantDomains(token, tenantId) {
  try {
    const response = await axios.get(`${API_URL}/tenants/${tenantId}/domains`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al obtener dominios";
  }
}

export async function getTenantDomain(token, tenantId, domainId) {
  try {
    const response = await axios.get(`${API_URL}/tenants/${tenantId}/domains/${domainId}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al obtener el dominio";
  }
}

export async function createTenantDomain(token, tenantId, data) {
  try {
    const response = await axios.post(`${API_URL}/tenants/${tenantId}/domains`, data, {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al crear el dominio";
  }
}

export async function updateTenantDomain(token, tenantId, domainId, data) {
  try {
    const response = await axios.put(`${API_URL}/tenants/${tenantId}/domains/${domainId}`, data, {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al actualizar el dominio";
  }
}

export async function deleteTenantDomain(token, tenantId, domainId) {
  try {
    const response = await axios.delete(`${API_URL}/tenants/${tenantId}/domains/${domainId}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al eliminar el dominio";
  }
}
