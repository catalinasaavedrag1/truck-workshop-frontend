import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BellOff, CheckCheck, Plus, SlidersHorizontal } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { Input } from '../../../shared/components/Input/Input'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatDate } from '../../../shared/utils/formatDate'
import styles from '../components/NotificationsModule.module.css'
import { alertSubscriptionsMock, notificationsMock } from '../mocks/notifications.mock'
import {
  createAlertSubscription,
  updateAlertSubscription,
  updateNotification,
} from '../services/notifications.service'
import type {
  AlertChannel,
  AlertSubscription,
  AlertSubscriptionPayload,
  NotificationSeverity,
  NotificationStatus,
  OperationalNotification,
} from '../types/notification.types'
import { severityLabel, severityTone } from '../utils/notificationDisplay'

type NotificationFilter = 'all' | 'unread' | 'critical' | 'today' | 'archived'

const sourceModuleOptions = [
  { label: 'Telemetria / GPS', value: 'Telemetria / GPS' },
  { label: 'Casos taller', value: 'Casos taller' },
  { label: 'Cotizaciones taller', value: 'Cotizaciones taller' },
  { label: 'Gestion inventario', value: 'Gestion inventario' },
  { label: 'Documentacion flota', value: 'Documentacion flota' },
  { label: 'Fletes', value: 'Fletes' },
]

const eventTypeOptions = [
  { label: 'Alerta critica GPS', value: 'Alerta critica GPS' },
  { label: 'SLA en riesgo', value: 'SLA en riesgo' },
  { label: 'Stock bajo minimo', value: 'Stock bajo minimo' },
  { label: 'Documento por vencer', value: 'Documento por vencer' },
  { label: 'Cotizacion por vencer', value: 'Cotizacion por vencer' },
  { label: 'Aprobacion pendiente', value: 'Aprobacion pendiente' },
]

const severityOptions = [
  { label: 'Critica', value: 'critical' },
  { label: 'Alerta', value: 'warning' },
  { label: 'Info', value: 'info' },
  { label: 'OK', value: 'success' },
]

const channelOptions = [
  { label: 'En plataforma', value: 'in_app' },
  { label: 'Correo', value: 'email' },
  { label: 'WhatsApp', value: 'whatsapp' },
]

export function NotificationsPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>(
    searchParams.get('tab') === 'subscriptions' ? 'all' : 'unread',
  )
  const [savedNotifications, setSavedNotifications] = useState<OperationalNotification[]>([])
  const [savedSubscriptions, setSavedSubscriptions] = useState<AlertSubscription[]>([])
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { data: notificationData } = useResourceList<OperationalNotification>('/notifications', notificationsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: subscriptionData } = useResourceList<AlertSubscription>(
    '/notifications/subscriptions',
    alertSubscriptionsMock,
    { order: 'desc', sort: 'updatedAt' },
  )
  const notifications = useMemo(
    () => mergeById(notificationData, savedNotifications).sort(byCreatedDesc),
    [notificationData, savedNotifications],
  )
  const subscriptions = useMemo(
    () => mergeById(subscriptionData, savedSubscriptions).sort((a, b) => a.sourceModule.localeCompare(b.sourceModule, 'es-CL')),
    [savedSubscriptions, subscriptionData],
  )
  const normalizedQuery = normalizeSearch(query)
  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter = matchesFilterState(notification, activeFilter)
    const matchesQuery = !normalizedQuery || normalizeSearch([
      notification.title,
      notification.message,
      notification.sourceModule,
      notification.relatedEntityLabel,
      notification.assignedTo,
      notification.severity,
    ].join(' ')).includes(normalizedQuery)

    return matchesFilter && matchesQuery
  })
  const stats = {
    archived: notifications.filter((notification) => notification.status === 'archived').length,
    critical: notifications.filter((notification) => notification.severity === 'critical' && notification.status !== 'archived').length,
    enabledSubscriptions: subscriptions.filter((subscription) => subscription.isEnabled).length,
    unread: notifications.filter((notification) => notification.status === 'unread').length,
  }
  const filters: Array<{ count: number; key: NotificationFilter; label: string }> = [
    { count: notifications.filter((notification) => notification.status !== 'archived').length, key: 'all', label: 'Activas' },
    { count: stats.unread, key: 'unread', label: 'Sin leer' },
    { count: stats.critical, key: 'critical', label: 'Criticas' },
    { count: notifications.filter((notification) => isToday(notification.createdAt)).length, key: 'today', label: 'Hoy' },
    { count: stats.archived, key: 'archived', label: 'Archivadas' },
  ]

  const handleNotificationUpdate = async (
    notification: OperationalNotification,
    status: NotificationStatus,
  ) => {
    const payload = {
      readAt: status === 'read' ? new Date().toISOString() : notification.readAt,
      status,
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

  const handleSubscriptionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload: AlertSubscriptionPayload = {
      channel: String(formData.get('channel') || 'in_app') as AlertChannel,
      createdBy: 'Centro de notificaciones',
      deliveryTarget: String(formData.get('deliveryTarget') || '').trim(),
      eventType: String(formData.get('eventType') || '').trim(),
      isEnabled: true,
      quietHoursEnd: String(formData.get('quietHoursEnd') || '').trim(),
      quietHoursStart: String(formData.get('quietHoursStart') || '').trim(),
      severity: String(formData.get('severity') || 'warning') as NotificationSeverity,
      sourceModule: String(formData.get('sourceModule') || '').trim(),
      updatedBy: 'Centro de notificaciones',
      userId: 'user-operaciones',
      userName: String(formData.get('userName') || 'Operaciones Taller').trim(),
    }

    if (!payload.deliveryTarget || !payload.eventType || !payload.sourceModule) {
      setFormError('Completa modulo, evento y destino para crear la suscripcion.')
      return
    }

    setFormError('')
    setIsSaving(true)

    try {
      const savedSubscription = await createAlertSubscription(payload)
      setSavedSubscriptions((current) => [
        savedSubscription,
        ...current.filter((subscription) => subscription.id !== savedSubscription.id),
      ])
      form.reset()
    } catch (error) {
      setFormError(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubscriptionToggle = async (subscription: AlertSubscription) => {
    const payload = {
      isEnabled: !subscription.isEnabled,
      updatedBy: 'Centro de notificaciones',
    }

    try {
      const updatedSubscription = await updateAlertSubscription(subscription.id, payload)
      setSavedSubscriptions((current) => [
        updatedSubscription,
        ...current.filter((item) => item.id !== updatedSubscription.id),
      ])
    } catch {
      setSavedSubscriptions((current) => [
        { ...subscription, ...payload },
        ...current.filter((item) => item.id !== subscription.id),
      ])
    }
  }

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          description="Centro operacional para revisar alertas, marcar pendientes y suscribirse a eventos criticos por modulo."
          title="Notificaciones y alertas"
        />

        <div className={styles.metricGrid}>
          <MetricCard helper="pendientes de lectura" label="Sin leer" value={stats.unread} />
          <MetricCard helper="requieren accion inmediata" label="Criticas" value={stats.critical} />
          <MetricCard helper="reglas activas de aviso" label="Suscripciones" value={stats.enabledSubscriptions} />
          <MetricCard helper="historial cerrado" label="Archivadas" value={stats.archived} />
        </div>

        <div className={styles.toolbar}>
          <Input
            label="Buscar alertas"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Modulo, patente, caso, cliente, SKU o responsable"
            type="search"
            value={query}
          />
          <div className={styles.filterRow}>
            {filters.map((filter) => (
              <button
                className={[
                  styles.filterButton,
                  activeFilter === filter.key ? styles.filterButtonActive : '',
                ].filter(Boolean).join(' ')}
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                type="button"
              >
                <span>{filter.label}</span>
                <Badge tone={activeFilter === filter.key ? 'info' : 'neutral'}>{filter.count}</Badge>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.contentGrid}>
          <Card>
            <div className={styles.notificationFeed}>
              {filteredNotifications.map((notification) => (
                <article
                  className={[
                    styles.feedItem,
                    notification.status === 'unread' ? styles.unread : '',
                  ].filter(Boolean).join(' ')}
                  key={notification.id}
                >
                  <div className={styles.feedItemHeader}>
                    <div className={styles.feedItemTitle}>
                      <div className={styles.inlineActions}>
                        <Badge tone={severityTone(notification.severity)}>{severityLabel(notification.severity)}</Badge>
                        <Badge tone={notification.status === 'unread' ? 'warning' : 'neutral'}>
                          {statusLabel(notification.status)}
                        </Badge>
                      </div>
                      <strong>{notification.title}</strong>
                      <span className={styles.helper}>{notification.sourceModule} / {notification.assignedTo}</span>
                    </div>
                    <div className={styles.inlineActions}>
                      {notification.actionPath ? (
                        <Link to={notification.actionPath}>
                          <Button size="sm" type="button" variant="secondary">
                            Abrir
                          </Button>
                        </Link>
                      ) : null}
                      {notification.status === 'unread' ? (
                        <Button
                          icon={<CheckCheck size={16} />}
                          onClick={() => void handleNotificationUpdate(notification, 'read')}
                          size="sm"
                          type="button"
                        >
                          Leida
                        </Button>
                      ) : null}
                      {notification.status !== 'archived' ? (
                        <Button
                          onClick={() => void handleNotificationUpdate(notification, 'archived')}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Archivar
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  <div className={styles.notificationMeta}>
                    <span>{notification.relatedEntityLabel || 'Sin entidad'}</span>
                    <span>Creada {formatDate(notification.createdAt || '')}</span>
                    {notification.dueAt ? <span>Vence {formatDate(notification.dueAt)}</span> : null}
                  </div>
                </article>
              ))}
              {filteredNotifications.length === 0 ? (
                <EmptyState
                  description="Ajusta los filtros para ver otras alertas o crea una nueva suscripcion."
                  icon={<BellOff size={22} />}
                  title="Sin alertas para este filtro"
                />
              ) : null}
            </div>
          </Card>

          <div className={styles.subscriptionList}>
            <Card>
              <div className="stack">
                <div className={styles.inlineActions}>
                  <SlidersHorizontal size={18} />
                  <div>
                    <h2 className="section-title">Suscribirse a alertas</h2>
                    <p className="muted-text">Define que eventos deben avisar por plataforma, correo o WhatsApp.</p>
                  </div>
                </div>
                <form className={styles.formGrid} onSubmit={handleSubscriptionSubmit}>
                  {formError ? <p className={styles.emptyText}>{formError}</p> : null}
                  <Input label="Usuario" name="userName" placeholder="Operaciones Taller" />
                  <Select label="Canal" name="channel" options={channelOptions} />
                  <Select label="Modulo" name="sourceModule" options={sourceModuleOptions} />
                  <Select label="Evento" name="eventType" options={eventTypeOptions} />
                  <Select label="Severidad minima" name="severity" options={severityOptions} />
                  <Input label="Destino" name="deliveryTarget" placeholder="Centro, correo o +56..." />
                  <Input label="Silencio desde" name="quietHoursStart" placeholder="22:00" />
                  <Input label="Silencio hasta" name="quietHoursEnd" placeholder="07:00" />
                  <div className={styles.span2}>
                    <Button disabled={isSaving} icon={<Plus size={18} />} type="submit">
                      {isSaving ? 'Creando...' : 'Crear suscripcion'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>

            {subscriptions.map((subscription) => (
              <div className={styles.subscriptionCard} key={subscription.id}>
                <div className={styles.subscriptionTop}>
                  <strong>{subscription.sourceModule}</strong>
                  <Badge tone={subscription.isEnabled ? 'success' : 'neutral'}>
                    {subscription.isEnabled ? 'Activa' : 'Pausada'}
                  </Badge>
                </div>
                <div className={styles.subscriptionMeta}>
                  <span>{subscription.eventType} / {severityLabel(subscription.severity)}</span>
                  <span>{channelLabel(subscription.channel)} / {subscription.deliveryTarget}</span>
                  <span>Silencio {subscription.quietHoursStart || '--'} a {subscription.quietHoursEnd || '--'}</span>
                </div>
                <Button
                  onClick={() => void handleSubscriptionToggle(subscription)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {subscription.isEnabled ? 'Pausar' : 'Activar'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

function MetricCard({ helper, label, value }: { helper: string; label: string; value: number | string }) {
  return (
    <div className={styles.metricCard}>
      <small>{label}</small>
      <strong>{value}</strong>
      <span className={styles.helper}>{helper}</span>
    </div>
  )
}

function matchesFilterState(notification: OperationalNotification, filter: NotificationFilter) {
  if (filter === 'unread') return notification.status === 'unread'
  if (filter === 'critical') return notification.severity === 'critical' && notification.status !== 'archived'
  if (filter === 'today') return isToday(notification.createdAt)
  if (filter === 'archived') return notification.status === 'archived'

  return notification.status !== 'archived'
}

function statusLabel(status: NotificationStatus) {
  const labels: Record<NotificationStatus, string> = {
    archived: 'Archivada',
    read: 'Leida',
    unread: 'Sin leer',
  }

  return labels[status]
}

function channelLabel(channel: AlertChannel) {
  const labels: Record<AlertChannel, string> = {
    email: 'Correo',
    in_app: 'Plataforma',
    whatsapp: 'WhatsApp',
  }

  return labels[channel]
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

function isToday(value?: string) {
  if (!value) return false

  return new Date(value).toDateString() === new Date().toDateString()
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}
