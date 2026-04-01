// (Eliminada duplicidad de getUsers)
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:6701";

export async function getMe(token) {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al obtener usuario";
  }
}

export async function getUsers(token) {
  try {
    const response = await axios.get(`${API_URL}/auth/users`, {
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error al obtener usuarios";
  }
}
