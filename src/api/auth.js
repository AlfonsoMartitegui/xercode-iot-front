import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:6701";

export async function login({ username, password }) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password }, {
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error de autenticación";
  }
}
