function stringifyDetail(detail) {
  if (!detail) {
    return "";
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || JSON.stringify(item)).join(". ");
  }

  return detail.msg || detail.detail || JSON.stringify(detail);
}

export function getApiErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail || error.response?.data?.message;
  const message = stringifyDetail(detail) || error.message || fallback;
  const normalized = message.toLowerCase();

  if (
    normalized.includes("email") &&
    (
      normalized.includes("unique") ||
      normalized.includes("duplicate") ||
      normalized.includes("duplicado") ||
      normalized.includes("existe") ||
      normalized.includes("integrity")
    )
  ) {
    return "Ya existe un usuario con ese email.";
  }

  return message || fallback;
}
