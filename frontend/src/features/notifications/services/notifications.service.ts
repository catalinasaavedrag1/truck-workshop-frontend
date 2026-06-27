import { createResource, updateResource } from '../../../shared/services/resourceApi'
import type {
  AlertSubscription,
  AlertSubscriptionPayload,
  OperationalNotification,
  OperationalNotificationPayload,
} from '../types/notification.types'

export async function updateNotification(notificationId: string, payload: Partial<OperationalNotificationPayload>) {
  return updateResource<OperationalNotification, Partial<OperationalNotificationPayload>>(
    '/notifications',
    notificationId,
    payload,
  )
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
