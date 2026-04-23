import axios from "axios";
import { getApiErrorMessage } from "./errors";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:6701";

export async function editUser(token, userId, data) {
  try {
    const response = await axios.post(`${API_URL}/auth/user/${userId}`, data, {
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw getApiErrorMessage(error, "Error al editar usuario");
  }
}
