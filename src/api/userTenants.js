import axios from "axios";
import { getApiErrorMessage } from "./errors";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:6701";

function getAuthHeaders(token) {
  return {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getUserTenants(token, userId) {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}/tenants`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw getApiErrorMessage(error, "Error al obtener membresias");
  }
}

export async function createUserTenant(token, userId, data) {
  try {
    const response = await axios.post(`${API_URL}/users/${userId}/tenants`, data, {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw getApiErrorMessage(error, "Error al crear membresia");
  }
}

export async function updateUserTenant(token, userId, tenantId, data) {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}/tenants/${tenantId}`, data, {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw getApiErrorMessage(error, "Error al actualizar membresia");
  }
}

export async function deleteUserTenant(token, userId, tenantId) {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}/tenants/${tenantId}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw getApiErrorMessage(error, "Error al eliminar membresia");
  }
}
