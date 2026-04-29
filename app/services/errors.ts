function stringifyDetail(detail: unknown): string {
  if (!detail) {
    return ''
  }

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        if (item && typeof item === 'object' && 'msg' in item) {
          return String(item.msg)
        }

        return JSON.stringify(item)
      })
      .join('. ')
  }

  if (typeof detail === 'object') {
    if ('msg' in detail && typeof detail.msg === 'string') {
      return detail.msg
    }

    if ('detail' in detail && typeof detail.detail === 'string') {
      return detail.detail
    }
  }

  return JSON.stringify(detail)
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const maybeError = error as {
    _data?: { detail?: unknown; message?: unknown }
    data?: { detail?: unknown; message?: unknown }
    response?: { _data?: { detail?: unknown; message?: unknown } }
    message?: string
  }

  const detail =
    maybeError?._data?.detail ??
    maybeError?._data?.message ??
    maybeError?.data?.detail ??
    maybeError?.data?.message ??
    maybeError?.response?._data?.detail ??
    maybeError?.response?._data?.message

  const message = stringifyDetail(detail) || maybeError?.message || fallback
  const normalized = message.toLowerCase()

  if (
    normalized.includes('email') &&
    (
      normalized.includes('unique') ||
      normalized.includes('duplicate') ||
      normalized.includes('duplicado') ||
      normalized.includes('existe') ||
      normalized.includes('integrity')
    )
  ) {
    return 'Ya existe un usuario con ese email.'
  }

  return message || fallback
}

export function normalizeApiError(error: unknown, fallback = 'Se ha producido un error inesperado.'): Error {
  return new Error(getApiErrorMessage(error, fallback))
}
