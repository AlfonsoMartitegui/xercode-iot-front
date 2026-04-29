import { normalizeApiError } from '~/services/errors'

export function useApi() {
  const config = useRuntimeConfig()
  const token = useState<string | null>('auth:token', () => null)

  return $fetch.create({
    baseURL: config.public.apiUrl,
    headers: {
      accept: 'application/json',
    },
    onRequest({ options }) {
      const headers = new Headers(options.headers ?? {})

      if (token.value) {
        headers.set('Authorization', `Bearer ${token.value}`)
      }

      if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }

      options.headers = headers
    },
    onResponseError({ response }) {
      throw normalizeApiError(response)
    },
  })
}
