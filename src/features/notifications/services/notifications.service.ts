import { createResource, listResource, updateResource } from '../../../shared/services/resourceApi'
import { alertSubscriptionsMock, notificationsMock } from '../mocks/notifications.mock'
import type {
  AlertSubscription,
  AlertSubscriptionPayload,
  OperationalNotification,
  OperationalNotificationPayload,
} from '../types/notification.types'

export async function getNotifications() {
  return listResource<OperationalNotification>('/notifications', notificationsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
}

export async function updateNotification(notificationId: string, payload: Partial<OperationalNotificationPayload>) {
  return updateResource<OperationalNotification, Partial<OperationalNotificationPayload>>(
    '/notifications',
    notificationId,
    payload,
  )
}

export async function getAlertSubscriptions() {
  return listResource<AlertSubscription>('/notifications/subscriptions', alertSubscriptionsMock, {
    order: 'desc',
    sort: 'updatedAt',
  })
}

export async function createAlertSubscription(payload: AlertSubscriptionPayload) {
  return createResource<AlertSubscription, AlertSubscriptionPayload>('/notifications/subscriptions', payload)
}

export async function updateAlertSubscription(subscriptionId: string, payload: Partial<AlertSubscriptionPayload>) {
  return updateResource<AlertSubscription, Partial<AlertSubscriptionPayload>>(
    '/notifications/subscriptions',
    subscriptionId,
    payload,
  )
}
