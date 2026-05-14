import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { formatDate } from '../../../shared/utils/formatDate'
import { notificationsMock } from '../mocks/notifications.mock'
import { updateNotification } from '../services/notifications.service'
import type { OperationalNotification } from '../types/notification.types'
import { severityLabel, severityTone } from '../utils/notificationDisplay'
import styles from './NotificationsModule.module.css'

export function NotificationCenterButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [savedNotifications, setSavedNotifications] = useState<OperationalNotification[]>([])
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const { data } = useResourceList<OperationalNotification>('/notifications', notificationsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const notifications = useMemo(
    () => mergeById(data, savedNotifications).sort(byCreatedDesc),
    [data, savedNotifications],
  )
  const visibleNotifications = notifications.filter((notification) => notification.status !== 'archived').slice(0, 6)
  const unread = notifications.filter((notification) => notification.status === 'unread')

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const markAsRead = async (notification: OperationalNotification) => {
    if (notification.status !== 'unread') {
      return
    }

    const payload = {
      readAt: new Date().toISOString(),
      status: 'read' as const,
      updatedBy: 'Centro de notificaciones',
    }

    try {
      const updatedNotification = await updateNotification(notification.id, payload)
      setSavedNotifications((current) => [
        updatedNotification,
        ...current.filter((item) => item.id !== updatedNotification.id),
      ])
    } catch {
      setSavedNotifications((current) => [
        { ...notification, ...payload },
        ...current.filter((item) => item.id !== notification.id),
      ])
    }
  }

  const markAllAsRead = async () => {
    const currentUnread = notifications.filter((notification) => notification.status === 'unread')

    const updatedNotifications = await Promise.all(
      currentUnread.map(async (notification) => {
        const payload = {
          readAt: new Date().toISOString(),
          status: 'read' as const,
          updatedBy: 'Centro de notificaciones',
        }

        try {
          return await updateNotification(notification.id, payload)
        } catch {
          return { ...notification, ...payload }
        }
      }),
    )

    setSavedNotifications((current) => mergeById(current, updatedNotifications))
  }

  return (
    <div className={styles.notificationWrap} ref={wrapRef}>
      <button
        aria-expanded={isOpen}
        aria-label={`Notificaciones${unread.length > 0 ? `, ${unread.length} sin leer` : ''}`}
        className={styles.notificationButton}
        onClick={() => setIsOpen((current) => !current)}
        title="Notificaciones"
        type="button"
      >
        <Bell size={18} />
        {unread.length > 0 ? <span className={styles.unreadDot}>{unread.length}</span> : null}
      </button>

      {isOpen ? (
        <section aria-label="Centro de notificaciones" className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <h2>Notificaciones</h2>
              <p>{unread.length > 0 ? `${unread.length} requieren atencion` : 'Sin pendientes criticos'}</p>
            </div>
            <Button disabled={unread.length === 0} onClick={() => void markAllAsRead()} size="sm" type="button" variant="secondary">
              Marcar leidas
            </Button>
          </header>

          <div className={styles.notificationList}>
            {visibleNotifications.map((notification) => (
              <Link
                className={[
                  styles.notificationItem,
                  notification.status === 'unread' ? styles.unread : '',
                ].filter(Boolean).join(' ')}
                key={notification.id}
                onClick={() => {
                  void markAsRead(notification)
                  setIsOpen(false)
                }}
                to={notification.actionPath || ROUTES.notifications}
              >
                <div className={styles.notificationTop}>
                  <strong>{notification.title}</strong>
                  <Badge tone={severityTone(notification.severity)}>{severityLabel(notification.severity)}</Badge>
                </div>
                <p className={styles.notificationMessage}>{notification.message}</p>
                <div className={styles.notificationMeta}>
                  <span>{notification.sourceModule}</span>
                  <span>{notification.relatedEntityLabel || notification.assignedTo}</span>
                  <span>{formatDate(notification.createdAt || '')}</span>
                </div>
              </Link>
            ))}
            {visibleNotifications.length === 0 ? <p className={styles.emptyText}>No hay notificaciones activas.</p> : null}
          </div>

          <footer className={styles.panelFooter}>
            <Link onClick={() => setIsOpen(false)} to={ROUTES.notifications}>
              <Button size="sm" type="button" variant="secondary">
                Ver centro
              </Button>
            </Link>
            <Link onClick={() => setIsOpen(false)} to={`${ROUTES.notifications}?tab=subscriptions`}>
              <Button size="sm" type="button" variant="ghost">
                Suscripciones
              </Button>
            </Link>
          </footer>
        </section>
      ) : null}
    </div>
  )
}

function mergeById<T extends { id: string }>(backendData: T[], localData: T[]) {
  const localById = new Map(localData.map((item) => [item.id, item]))

  return [
    ...backendData.filter((item) => !localById.has(item.id)),
    ...localData,
  ]
}

function byCreatedDesc(first: OperationalNotification, second: OperationalNotification) {
  return new Date(second.createdAt || '').getTime() - new Date(first.createdAt || '').getTime()
}
