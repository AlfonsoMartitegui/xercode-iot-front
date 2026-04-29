export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth()

  await auth.hydrate()

  return navigateTo(auth.isAuthenticated.value ? '/dashboard' : '/login', {
    replace: true,
  })
})
