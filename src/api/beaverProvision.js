import axios from "axios";
import { getApiErrorMessage } from "./errors";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:6701";

export async function provisionBeaverUser(token, userId, tenantId, password) {
  try {
    const response = await axios.post(
      `${API_URL}/users/${userId}/tenants/${tenantId}/beaver/provision`,
      { password },
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw getApiErrorMessage(error, "No se pudo provisionar el usuario en Beaver");
  }
}
