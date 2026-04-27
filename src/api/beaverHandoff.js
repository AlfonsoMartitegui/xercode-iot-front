import axios from "axios";
import { getApiErrorMessage } from "./errors";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:6701";

export async function createBeaverHandoff(token, tenantId) {
  const body = tenantId !== undefined && tenantId !== null && tenantId !== "" ? { tenant_id: tenantId } : {};

  try {
    const response = await axios.post(`${API_URL}/auth/beaver-handoff`, body, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw getApiErrorMessage(error, "No se pudo iniciar sesion en Beaver. Contacta con un administrador.");
  }
}
