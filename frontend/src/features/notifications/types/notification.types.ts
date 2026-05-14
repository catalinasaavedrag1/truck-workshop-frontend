export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical'
export type NotificationStatus = 'unread' | 'read' | 'archived'
export type NotificationCategory = 'operations' | 'maintenance' | 'commercial' | 'inventory' | 'security' | 'system'
export type AlertChannel = 'in_app' | 'email' | 'whatsapp'

export interface OperationalNotification {
  id: string
  title: string
  message: string
  category: NotificationCategory
  severity: NotificationSeverity
  status: NotificationStatus
  sourceModule: string
  relatedEntityType?: string
  relatedEntityId?: string
  relatedEntityLabel?: string
  actionPath?: string
  assignedTo: string
  dueAt?: string
  readAt?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface AlertSubscription {
  id: string
  userId: string
  userName: string
  channel: AlertChannel
  sourceModule: string
  eventType: string
  severity: NotificationSeverity
  deliveryTarget: string
  isEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
  createdAt?: string
  updatedAt?: string
}

export type OperationalNotificationPayload = Omit<OperationalNotification, 'id' | 'createdAt' | 'updatedAt' | 'deletedBy'>
export type AlertSubscriptionPayload = Omit<AlertSubscription, 'id' | 'createdAt' | 'updatedAt' | 'deletedBy'>
