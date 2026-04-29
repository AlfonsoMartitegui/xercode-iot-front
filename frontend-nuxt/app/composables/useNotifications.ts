export type NotificationType = 'success' | 'error' | 'info'

export interface NotificationMessage {
  id: number
  type: NotificationType
  message: string
}

export function useNotifications() {
  const notifications = useState<NotificationMessage[]>('notifications', () => [])

  function push(type: NotificationType, message: string) {
    const notification = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type,
      message,
    }

    notifications.value = [notification, ...notifications.value].slice(0, 4)
    return notification.id
  }

  function success(message: string) {
    return push('success', message)
  }

  function error(message: string) {
    return push('error', message)
  }

  function info(message: string) {
    return push('info', message)
  }

  function dismiss(id: number) {
    notifications.value = notifications.value.filter((notification) => notification.id !== id)
  }

  function clear() {
    notifications.value = []
  }

  return {
    notifications,
    success,
    error,
    info,
    dismiss,
    clear,
  }
}
