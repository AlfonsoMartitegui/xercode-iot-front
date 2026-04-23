import axios from "axios";
import { getApiErrorMessage } from "./errors";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:6701";

export async function changeBeaverPassword(token, userId, tenantId, password) {
  try {
    const response = await axios.put(
      `${API_URL}/users/${userId}/tenants/${tenantId}/beaver/change-password`,
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
    throw getApiErrorMessage(
      error,
      "Beaver password could not be updated because the Beaver account was not found by the current email."
    );
  }
}
