import axios from "axios";
import { getApiErrorMessage } from "./errors";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:6701";

export async function getTenantBeaverRoles(token, tenantId) {
  try {
    const response = await axios.get(`${API_URL}/tenants/${tenantId}/beaver/roles`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw getApiErrorMessage(error, "Could not load Beaver roles for this tenant");
  }
}
