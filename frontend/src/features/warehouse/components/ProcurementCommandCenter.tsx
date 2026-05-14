import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  Clock3,
  ClipboardList,
  Command,
  FileWarning,
  Keyboard,
  PackageCheck,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Users,
  Warehouse,
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { DrawerPanel } from '../../../shared/components/DrawerPanel/DrawerPanel'
import { EntityLink } from '../../../shared/components/EntityLink'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { useSearch } from '../../../shared/hooks/useSearch'
import { useSelection } from '../../../shared/hooks/useSelection'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Part } from '../../parts/types/part.types'
import type { PurchaseOrder, PurchaseRequest } from '../../purchase-orders/types/purchaseOrder.types'
import type { Supplier } from '../../suppliers/types/supplier.types'
import {
  getBuyerRankingRows,
  getProcurementDashboard,
  getProcurementSummaryMetrics,
  getSuggestionGroupLabel,
  procurementPrimaryActions,
} from '../services/procurementInsights.service'
import type {
  CategorySupplyHealth,
  DocumentControlItem,
  OperationalBlocker,
  ProcurementLink,
  PurchaseReceipt,
  ReplenishmentCalendarEvent,
  StockHealth,
  SupplierPerformance,
} from '../types/procurement.types'
import type { WarehouseStockItem } from '../types/warehouse.types'
import { AuditAlertTable } from './AuditAlertTable'
import { BuyerPerformanceCard } from './BuyerPerformanceCard'
import styles from './InventoryModule.module.css'
import { OperationalKpiCard } from './OperationalKpiCard'
import { ActionBadge, RiskBadge, StatusBadge } from './ProcurementBadges'
import { PurchaseRequestTable } from './PurchaseRequestTable'
import { PurchaseSuggestionTable } from './PurchaseSuggestionTable'
import { ReceiptTable } from './ReceiptTable'
import { Sku360Drawer } from './Sku360Drawer'
import { SupplierComparisonTable } from './SupplierComparisonTable'
import { SupplyPurchaseOrderTable } from './SupplyPurchaseOrderTable'

type ProcurementTab =
  | 'dashboard'
  | 'suggestions'
  | 'requests'
  | 'orders'
  | 'receipts'
  | 'skus'
  | 'stock'
  | 'suppliers'
  | 'buyers'
  | 'audit'
  | 'reports'
  | 'categories'
  | 'calendar'
  | 'documents'

type ProcurementTabGroup = 'Decision' | 'Ejecucion' | 'Control'
type OperationalTone = 'danger' | 'info' | 'success' | 'warning'
type CalendarMode = 'Dia' | 'Semana' | 'Mes' | 'Timeline operativo'

interface OperationalContext {
  action: string
  amount?: number
  href?: string
  impact: string
  kind: string
  links?: ProcurementLink[]
  risk?: 'critical' | 'high' | 'medium' | 'low'
  status?: string
  subtitle: string
  title: string
}

const tabs: Array<{
  description: string
  group: ProcurementTabGroup
  icon: typeof Warehouse
  id: ProcurementTab
  label: string
}> = [
  { description: 'Bloqueos, dinero comprometido y accion inmediata.', group: 'Decision', icon: Warehouse, id: 'dashboard', label: 'Panel' },
  { description: 'Que comprar, esperar o frenar con justificacion.', group: 'Decision', icon: PackageSearch, id: 'suggestions', label: 'Reposicion' },
  { description: 'Solicitudes detectadas, aprobaciones y duplicados.', group: 'Decision', icon: ClipboardList, id: 'requests', label: 'Solicitudes' },
  { description: 'Seguimiento de OC, atrasos y proveedor.', group: 'Ejecucion', icon: ShoppingCart, id: 'orders', label: 'OC' },
  { description: 'Llegadas completas, parciales o con diferencia.', group: 'Ejecucion', icon: PackageCheck, id: 'receipts', label: 'Recepcion' },
  { description: 'Facturas, guias, respaldos y bloqueo de cierre.', group: 'Ejecucion', icon: ReceiptText, id: 'documents', label: 'Documentos' },
  { description: 'Ficha SKU, cobertura, consumo y sustitutos.', group: 'Control', icon: PackageSearch, id: 'skus', label: 'SKUs' },
  { description: 'Stock util, reservado, bloqueado y muerto.', group: 'Control', icon: Warehouse, id: 'stock', label: 'Stock' },
  { description: 'Precio, lead time real y cumplimiento.', group: 'Control', icon: Building2, id: 'suppliers', label: 'Proveedores' },
  { description: 'Responsables, pendientes y compras riesgosas.', group: 'Control', icon: Users, id: 'buyers', label: 'Compradores' },
  { description: 'Alertas de compras malas o injustificadas.', group: 'Control', icon: ShieldCheck, id: 'audit', label: 'Auditoria' },
  { description: 'Indicadores por categoria, SKU y periodo.', group: 'Control', icon: BarChart3, id: 'reports', label: 'Reportes' },
  { description: 'Capital, quiebres y riesgo por familia.', group: 'Control', icon: FileWarning, id: 'categories', label: 'Categorias' },
  { description: 'Llegadas, atrasos y quiebres proyectados.', group: 'Control', icon: CalendarDays, id: 'calendar', label: 'Calendario' },
]

const tabGroups: Array<{ helper: string; label: ProcurementTabGroup }> = [
  { helper: 'Que comprar, frenar o validar', label: 'Decision' },
  { helper: 'OC, recepcion y documentos', label: 'Ejecucion' },
  { helper: 'Stock, proveedores y auditoria', label: 'Control' },
]

const validTabs = new Set<ProcurementTab>(tabs.map((tab) => tab.id))
const calendarModes: CalendarMode[] = ['Dia', 'Semana', 'Mes', 'Timeline operativo']
const calendarPriorityOrder: Record<ReplenishmentCalendarEvent['risk'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

interface ProcurementCommandCenterProps {
  isLoading?: boolean
  parts?: Part[]
  purchaseOrders: PurchaseOrder[]
  purchaseRequests?: PurchaseRequest[]
  stockItems?: WarehouseStockItem[]
  suppliers?: Supplier[]
}

function BlockersTable({
  onInspect,
  rows,
}: {
  onInspect?: (item: OperationalBlocker) => void
  rows: OperationalBlocker[]
}) {
  const columns: TableColumn<OperationalBlocker>[] = [
    {
      header: 'Bloqueo',
      key: 'blocker',
      render: (item) => (
        <div className="stack-tight">
          {item.relatedEntity ? (
            <EntityLink id={item.relatedEntity.id} type={item.relatedEntity.type}>
              {item.relatedEntity.label}
            </EntityLink>
          ) : null}
          <strong>{item.blocker}</strong>
          <span className="muted-text">{item.nextAction}</span>
        </div>
      ),
    },
    { header: 'Tipo', key: 'type', render: (item) => <StatusBadge>{item.type}</StatusBadge> },
    {
      header: 'Impacto',
      key: 'impact',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.impact}</span>
          <span className="muted-text">{formatCurrency(item.affectedAmount)}</span>
        </div>
      ),
    },
    {
      header: 'Responsable',
      key: 'responsible',
      render: (item) => (
        <Link to={`${ROUTES.warehouseManagers}?responsible=${encodeURIComponent(item.responsible)}`}>{item.responsible}</Link>
      ),
    },
    { header: 'Fecha limite', key: 'dueDate', render: (item) => formatDate(item.dueDate) },
    {
      align: 'right',
      header: 'Accion rapida',
      key: 'actions',
      render: (item) => (
        <Button
          onClick={() => onInspect?.(item)}
          size="sm"
          type="button"
          variant={item.type === 'OC' || item.type === 'SKU' ? 'primary' : 'secondary'}
        >
          {item.quickAction}
        </Button>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="Sin bloqueos operacionales para la busqueda."
      getRowKey={(item) => item.id}
      pageSize={6}
      searchPlaceholder="Buscar bloqueo, responsable, SKU, OC, proveedor o accion"
    />
  )
}

function StockHealthTable({ rows }: { rows: StockHealth[] }) {
  const columns: TableColumn<StockHealth>[] = [
    {
      header: 'SKU / producto',
      key: 'sku',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.sku} type="sku">
            {item.sku}
          </EntityLink>
          <span className="muted-text">{item.product}</span>
          <EntityLink id={item.locationCode} type="warehouseLocation" variant="subtle">
            {item.locationCode}
          </EntityLink>
        </div>
      ),
    },
    { header: 'Categoria', key: 'category', render: (item) => item.category },
    {
      align: 'right',
      header: 'Stock',
      key: 'physical',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.physical}</strong>
          <span className="muted-text">res. {item.reserved} / comp. {item.committed}</span>
          <span className="muted-text">bloq. {item.blocked} / trans. {item.inTransit}</span>
        </div>
      ),
    },
    { header: 'Estado', key: 'state', render: (item) => <StatusBadge>{item.state}</StatusBadge> },
    { align: 'right', header: 'Cobertura', key: 'coverageDays', render: (item) => `${item.coverageDays} dias` },
    { align: 'right', header: 'Valor', key: 'value', render: (item) => formatCurrency(item.value) },
    {
      align: 'right',
      header: 'Proxima accion',
      key: 'action',
      render: (item) => <Button size="sm" type="button" variant="secondary">{item.action}</Button>,
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay stock para los filtros seleccionados."
      getRowHref={(item) => `${ROUTES.parts}?sku=${encodeURIComponent(item.sku)}`}
      getRowKey={(item) => item.sku}
      getRowLabel={(item) => `Abrir SKU ${item.sku}`}
      pageSize={8}
      searchPlaceholder="Buscar SKU, categoria, ubicacion, estado o accion"
    />
  )
}

function SuppliersTable({ rows }: { rows: SupplierPerformance[] }) {
  const columns: TableColumn<SupplierPerformance>[] = [
    {
      header: 'Proveedor',
      key: 'supplierName',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.supplierId} type="supplier">
            {item.supplierName}
          </EntityLink>
          <span className="muted-text">{item.rut} - {item.contact}</span>
        </div>
      ),
    },
    {
      header: 'Categorias / SKUs',
      key: 'categories',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.categories.join(', ')}</span>
          <span className="muted-text">{item.skuCount} SKUs asociados</span>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Lead time',
      key: 'leadTimeRealDays',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.leadTimeRealDays} dias real</strong>
          <span className="muted-text">{item.leadTimePromisedDays} dias prometido</span>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'OC / monto',
      key: 'purchasedAmount',
      render: (item) => (
        <div className="stack-tight">
          <strong>{formatCurrency(item.purchasedAmount)}</strong>
          <span className="muted-text">{item.activePurchaseOrders} OC activas</span>
        </div>
      ),
    },
    {
      header: 'Cumplimiento',
      key: 'completeDeliveries',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.completeDeliveries} completas / {item.delayedDeliveries} atrasadas</span>
          <span className="muted-text">{item.partialReceipts} parciales - {item.claimCount} reclamos</span>
        </div>
      ),
    },
    {
      header: 'Recomendacion',
      key: 'recommendation',
      render: (item) => (
        <div className="stack-tight">
          <StatusBadge>{item.recommendation}</StatusBadge>
          <span className="muted-text">{item.recommendationReason}</span>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Accion',
      key: 'actions',
      render: () => <Button size="sm" type="button" variant="secondary">Comparar SKUs</Button>,
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay proveedores que coincidan."
      getRowHref={(item) => ROUTES.supplierDetail(item.supplierId)}
      getRowKey={(item) => item.supplierId}
      getRowLabel={(item) => `Abrir proveedor ${item.supplierName}`}
      pageSize={8}
      searchPlaceholder="Buscar proveedor, RUT, categoria, contacto o recomendacion"
    />
  )
}

function CategoryTable({ rows }: { rows: CategorySupplyHealth[] }) {
  const columns: TableColumn<CategorySupplyHealth>[] = [
    {
      header: 'Categoria',
      key: 'category',
      render: (item) => (
        <Link to={`${ROUTES.inventoryReport}?category=${encodeURIComponent(item.category)}`}>{item.category}</Link>
      ),
    },
    { align: 'right', header: 'Consumo mensual', key: 'monthlyConsumption', render: (item) => item.monthlyConsumption },
    {
      align: 'right',
      header: 'Capital',
      key: 'immobilizedStock',
      render: (item) => (
        <div className="stack-tight">
          <strong>{formatCurrency(item.immobilizedStock)}</strong>
          <span className="muted-text">pendiente {formatCurrency(item.pendingPurchase)}</span>
        </div>
      ),
    },
    {
      header: 'Salud',
      key: 'criticalSkus',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.criticalSkus} criticos - {item.overstockSkus} sobrestock - {item.deadSkus} muertos</span>
          <span className="muted-text">{item.trend}</span>
        </div>
      ),
    },
    {
      header: 'Riesgos',
      key: 'riskStockout',
      render: (item) => (
        <div className="stack-tight">
          <span>Quiebre <RiskBadge risk={item.riskStockout} /></span>
          <span>Sobrestock <RiskBadge risk={item.riskOverstock} /></span>
        </div>
      ),
    },
    {
      header: 'Responsable / proveedores',
      key: 'buyer',
      render: (item) => (
        <div className="stack-tight">
          <Link to={`${ROUTES.warehouseManagers}?buyer=${encodeURIComponent(item.buyer)}`}>{item.buyer}</Link>
          <span className="muted-text">{item.suppliers.join(', ')}</span>
        </div>
      ),
    },
    { header: 'Proxima accion', key: 'nextAction', render: (item) => item.nextAction },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay categorias que coincidan."
      getRowKey={(item) => item.category}
      pageSize={8}
      searchPlaceholder="Buscar categoria, comprador, proveedor o riesgo"
    />
  )
}

function DocumentsTable({
  onInspect,
  rows,
}: {
  onInspect?: (item: DocumentControlItem) => void
  rows: DocumentControlItem[]
}) {
  const columns: TableColumn<DocumentControlItem>[] = [
    {
      header: 'OC / proveedor',
      key: 'purchaseOrderNumber',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.purchaseOrderId} type="purchaseOrder">
            {item.purchaseOrderNumber}
          </EntityLink>
          <EntityLink id={item.supplierId} type="supplier" variant="subtle">
            {item.supplierName}
          </EntityLink>
        </div>
      ),
    },
    { header: 'Documento', key: 'documentState', render: (item) => <StatusBadge>{item.documentState}</StatusBadge> },
    { header: 'Diferencia', key: 'difference', render: (item) => item.difference },
    { align: 'right', header: 'Monto', key: 'amount', render: (item) => formatCurrency(item.amount) },
    { header: 'Vence', key: 'dueDate', render: (item) => formatDate(item.dueDate) },
    { header: 'Riesgo', key: 'risk', render: (item) => <RiskBadge risk={item.risk} /> },
    {
      align: 'right',
      header: 'Accion',
      key: 'action',
      render: (item) => (
        <Button
          onClick={() => onInspect?.(item)}
          size="sm"
          type="button"
          variant={item.action === 'Bloquear cierre' ? 'danger' : 'secondary'}
        >
          {item.action}
        </Button>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay documentos para la busqueda."
      getRowHref={(item) => ROUTES.purchaseOrderDetail(item.purchaseOrderId)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir documento ${item.purchaseOrderNumber}`}
      pageSize={8}
      searchPlaceholder="Buscar OC, proveedor, factura, guia o diferencia"
    />
  )
}

function CalendarTimeline({
  onInspect,
  rows,
}: {
  onInspect?: (event: ReplenishmentCalendarEvent) => void
  rows: ReplenishmentCalendarEvent[]
}) {
  const groupedRows = groupCalendarEventsByDate(rows)

  if (rows.length === 0) {
    return (
      <div className={styles.calendarEmpty}>
        <strong>Sin eventos para este periodo</strong>
        <span>Cambia el periodo o limpia la busqueda para volver a ver llegadas, quiebres y solicitudes.</span>
      </div>
    )
  }

  return (
    <div className={styles.calendarTimeline}>
      {groupedRows.map((group) => (
        <section className={styles.calendarDayGroup} key={group.label}>
          <div className={styles.calendarDayHeader}>
            <strong>{group.label}</strong>
            <span>{group.events.length} eventos</span>
          </div>
          <div className={styles.calendarEventList}>
            {group.events.map((event) => (
              <article className={[styles.calendarEvent, styles[getCalendarEventTone(event)]].join(' ')} key={event.id}>
                <div className={styles.calendarTime}>
                  <Clock3 aria-hidden size={15} />
                  <strong>{formatTime(event.date)}</strong>
                  <span>{getCalendarUrgencyLabel(event)}</span>
                </div>
                <div className={styles.calendarEventBody}>
                  <div className={styles.calendarEventTitle}>
                    <StatusBadge>{event.type}</StatusBadge>
                    <strong>{event.title}</strong>
                  </div>
                  <p>{getCalendarEventExplanation(event)}</p>
                  <div className={styles.calendarEventMeta}>
                    <span>Responsable: <strong>{event.responsible}</strong></span>
                    {event.provider ? <span>Proveedor: <strong>{event.provider}</strong></span> : null}
                    {event.purchaseOrderNumber ? (
                      <EntityLink id={event.purchaseOrderId || event.purchaseOrderNumber} type="purchaseOrder" variant="subtle">
                        {event.purchaseOrderNumber}
                      </EntityLink>
                    ) : null}
                    {event.relatedEntity && event.relatedEntity.type !== 'purchaseOrder' ? (
                      <EntityLink id={event.relatedEntity.id} type={event.relatedEntity.type} variant="subtle">
                        {event.relatedEntity.label}
                      </EntityLink>
                    ) : null}
                  </div>
                </div>
                <div className={styles.calendarEventAction}>
                  <RiskBadge risk={event.risk} />
                  <Button onClick={() => onInspect?.(event)} size="sm" type="button" variant={event.risk === 'critical' ? 'primary' : 'secondary'}>
                    {getCalendarAction(event)}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function CalendarOverview({
  events,
  onInspect,
}: {
  events: ReplenishmentCalendarEvent[]
  onInspect?: (event: ReplenishmentCalendarEvent) => void
}) {
  const sortedEvents = sortCalendarEvents(events)
  const nextEvent = sortedEvents[0]
  const criticalEvents = events.filter((event) => event.risk === 'critical' || event.risk === 'high')
  const receiptEvents = events.filter((event) => event.type.includes('OC') || event.type.includes('Recepcion'))
  const stockoutEvents = events.filter((event) => event.type === 'Quiebre proyectado' || event.type === 'Compra sugerida')
  const responsibleCount = new Set(events.map((event) => event.responsible)).size

  return (
    <div className={styles.calendarOverview}>
      <div className={[styles.calendarOverviewCard, styles.info].join(' ')}>
        <span>Proximo evento</span>
        <strong>{nextEvent ? formatTime(nextEvent.date) : 'Sin agenda'}</strong>
        <small>{nextEvent ? nextEvent.title : 'No hay eventos visibles para este filtro.'}</small>
      </div>
      <button className={[styles.calendarOverviewCard, criticalEvents.length > 0 ? styles.danger : styles.success].join(' ')} onClick={() => criticalEvents[0] ? onInspect?.(criticalEvents[0]) : undefined} type="button">
        <span>Riesgo alto</span>
        <strong>{criticalEvents.length}</strong>
        <small>{criticalEvents[0] ? getCalendarEventExplanation(criticalEvents[0]) : 'Sin riesgos criticos visibles.'}</small>
      </button>
      <div className={[styles.calendarOverviewCard, styles.warning].join(' ')}>
        <span>OC / recepciones</span>
        <strong>{receiptEvents.length}</strong>
        <small>Eventos que pueden dejar stock disponible o atrasar operaciones.</small>
      </div>
      <div className={[styles.calendarOverviewCard, stockoutEvents.length > 0 ? styles.danger : styles.neutral].join(' ')}>
        <span>Quiebres / decisiones</span>
        <strong>{stockoutEvents.length}</strong>
        <small>Compras sugeridas y quiebres proyectados que requieren decision.</small>
      </div>
      <div className={[styles.calendarOverviewCard, styles.neutral].join(' ')}>
        <span>Responsables activos</span>
        <strong>{responsibleCount}</strong>
        <small>Compradores o receptores con eventos dentro del filtro actual.</small>
      </div>
    </div>
  )
}

function CalendarPriorityBoard({
  events,
  onInspect,
}: {
  events: ReplenishmentCalendarEvent[]
  onInspect?: (event: ReplenishmentCalendarEvent) => void
}) {
  const columns = [
    {
      description: 'Quiebres, atrasos y compras que no pueden esperar.',
      events: events.filter((event) => event.risk === 'critical' || event.risk === 'high'),
      icon: AlertTriangle,
      label: 'Atender primero',
    },
    {
      description: 'OC y recepciones que deben confirmarse para habilitar stock.',
      events: events.filter((event) => event.type.includes('OC') || event.type.includes('Recepcion')),
      icon: PackageCheck,
      label: 'Llegadas y recepcion',
    },
    {
      description: 'Solicitudes, compras sugeridas y quiebres proyectados.',
      events: events.filter((event) => event.type === 'Compra sugerida' || event.type === 'Solicitud por vencer' || event.type === 'Quiebre proyectado'),
      icon: ClipboardList,
      label: 'Decision pendiente',
    },
  ]

  return (
    <div className={styles.calendarBoard}>
      {columns.map((column) => {
        const Icon = column.icon
        const visibleEvents = sortCalendarEvents(column.events).slice(0, 3)

        return (
          <section className={styles.calendarBoardColumn} key={column.label}>
            <div className={styles.calendarBoardHeader}>
              <span>
                <Icon aria-hidden size={16} />
                <strong>{column.label}</strong>
              </span>
              <small>{column.description}</small>
            </div>
            <div className={styles.calendarBoardItems}>
              {visibleEvents.length > 0 ? visibleEvents.map((event) => (
                <button className={styles.calendarBoardItem} key={event.id} onClick={() => onInspect?.(event)} type="button">
                  <span>{formatDate(event.date)} - {formatTime(event.date)}</span>
                  <strong>{event.title}</strong>
                  <small>{event.responsible} - {getCalendarAction(event)}</small>
                  <ArrowRight aria-hidden size={14} />
                </button>
              )) : (
                <p className={styles.calendarBoardEmpty}>Sin eventos en esta cola.</p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function filterCalendarEventsByMode(events: ReplenishmentCalendarEvent[], mode: CalendarMode) {
  if (mode === 'Timeline operativo') {
    return sortCalendarEvents(events)
  }

  return sortCalendarEvents(events.filter((event) => event.mode === mode))
}

function getCalendarModeCount(events: ReplenishmentCalendarEvent[], mode: CalendarMode) {
  return filterCalendarEventsByMode(events, mode).length
}

function sortCalendarEvents(events: ReplenishmentCalendarEvent[]) {
  return [...events].sort((first, second) => {
    const riskGap = calendarPriorityOrder[first.risk] - calendarPriorityOrder[second.risk]

    if (riskGap !== 0) {
      return riskGap
    }

    return new Date(first.date).getTime() - new Date(second.date).getTime()
  })
}

function groupCalendarEventsByDate(events: ReplenishmentCalendarEvent[]) {
  const groups = new Map<string, ReplenishmentCalendarEvent[]>()

  sortCalendarEvents(events).forEach((event) => {
    const label = formatDate(event.date)
    const current = groups.get(label) || []
    groups.set(label, [...current, event])
  })

  return Array.from(groups.entries()).map(([label, groupedEvents]) => ({
    events: groupedEvents,
    label,
  }))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getCalendarEventTone(event: ReplenishmentCalendarEvent) {
  if (event.risk === 'critical') {
    return 'danger'
  }

  if (event.risk === 'high' || event.type === 'OC atrasada' || event.type === 'Quiebre proyectado') {
    return 'warning'
  }

  if (event.type === 'Recepcion programada' || event.type === 'OC por llegar') {
    return 'info'
  }

  return 'neutral'
}

function getCalendarUrgencyLabel(event: ReplenishmentCalendarEvent) {
  if (event.risk === 'critical') {
    return 'Critico'
  }

  if (event.risk === 'high') {
    return 'Riesgo alto'
  }

  if (event.type === 'Recepcion programada') {
    return 'Recibir'
  }

  if (event.type === 'OC por llegar') {
    return 'Confirmar'
  }

  return 'Programado'
}

function getCalendarAction(event: ReplenishmentCalendarEvent) {
  const actions: Record<ReplenishmentCalendarEvent['type'], string> = {
    'Compra sugerida': 'Decidir compra',
    'OC atrasada': 'Seguir OC',
    'OC por llegar': 'Confirmar ETA',
    'Quiebre proyectado': 'Crear solicitud',
    'Recepcion programada': 'Recibir',
    'Solicitud por vencer': 'Validar solicitud',
  }

  return actions[event.type]
}

function getCalendarEventExplanation(event: ReplenishmentCalendarEvent) {
  const subject = event.purchaseOrderNumber || event.relatedEntity?.label || event.provider || 'abastecimiento'
  const explanations: Record<ReplenishmentCalendarEvent['type'], string> = {
    'Compra sugerida': `${subject} requiere decision antes de duplicar, esperar o comprar.`,
    'OC atrasada': `${subject} esta atrasada y puede bloquear recepciones o casos activos.`,
    'OC por llegar': `${subject} debe confirmarse para preparar recepcion y ubicacion.`,
    'Quiebre proyectado': `${subject} puede quedar sin stock si no se valida reposicion.`,
    'Recepcion programada': `${subject} debe recibirse, documentarse y ubicarse para liberar stock.`,
    'Solicitud por vencer': `${subject} necesita aprobacion, ajuste o rechazo con motivo.`,
  }

  return explanations[event.type]
}

function ProcurementFlowNav({
  activeTab,
  counts,
  onTabChange,
}: {
  activeTab: ProcurementTab
  counts: Record<ProcurementTab, number>
  onTabChange: (tab: ProcurementTab) => void
}) {
  return (
    <div className={styles.procurementFlowNav} aria-label="Flujo compras y abastecimiento">
      {tabGroups.map((group) => (
        <section className={styles.procurementFlowGroup} key={group.label}>
          <div className={styles.procurementFlowHeading}>
            <strong>{group.label}</strong>
            <span>{group.helper}</span>
          </div>
          <div className={styles.procurementStepGrid}>
            {tabs
              .filter((tab) => tab.group === group.label)
              .map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id

                return (
                  <button
                    aria-current={active ? 'page' : undefined}
                    className={[styles.procurementStepButton, active ? styles.procurementStepActive : ''].filter(Boolean).join(' ')}
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    title={tab.description}
                    type="button"
                  >
                    <Icon aria-hidden size={16} />
                    <span>{tab.label}</span>
                    <strong>{counts[tab.id]}</strong>
                  </button>
                )
              })}
          </div>
        </section>
      ))}
    </div>
  )
}

function ProcurementPriorityQueue({
  onTabChange,
  items,
}: {
  items: Array<{ helper: string; label: string; tab: ProcurementTab; tone: OperationalTone; value: string | number }>
  onTabChange: (tab: ProcurementTab) => void
}) {
  return (
    <div className={styles.procurementQueue}>
      {items.map((item) => (
        <button
          className={[styles.procurementQueueItem, styles[item.tone]].join(' ')}
          key={item.label}
          onClick={() => onTabChange(item.tab)}
          type="button"
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.helper}</small>
        </button>
      ))}
    </div>
  )
}

function ActiveViewGuide({
  action,
  activeTab,
  count,
  now,
  why,
}: {
  action: string
  activeTab: ProcurementTab
  count: number
  now: string
  why: string
}) {
  const tab = tabs.find((item) => item.id === activeTab) ?? tabs[0]

  return (
    <div className={styles.activeViewGuide}>
      <div className={styles.activeViewTitle}>
        <span>{tab.group}</span>
        <strong>{tab.label}</strong>
        <small>{tab.description}</small>
      </div>
      <div className={styles.activeViewGrid}>
        <div>
          <span>Ahora</span>
          <strong>{now}</strong>
        </div>
        <div>
          <span>Impacto</span>
          <strong>{why}</strong>
        </div>
        <div>
          <span>Proxima accion</span>
          <strong>{action}</strong>
        </div>
        <div>
          <span>Cola visible</span>
          <strong>{count}</strong>
        </div>
      </div>
    </div>
  )
}

function ProcurementCommandBar({
  onClearSearch,
  onFocusSearch,
  onTabChange,
}: {
  onClearSearch: () => void
  onFocusSearch: () => void
  onTabChange: (tab: ProcurementTab) => void
}) {
  const commands = [
    { hint: 'Alt+O', label: 'Nueva OC', to: ROUTES.purchaseOrderNew },
    { hint: 'Alt+S', label: 'Solicitudes', tab: 'requests' as const },
    { hint: 'Alt+R', label: 'Recepcion', tab: 'receipts' as const },
    { hint: 'Alt+P', label: 'Proveedores', tab: 'suppliers' as const },
    { hint: 'Alt+A', label: 'Auditoria', tab: 'audit' as const },
  ]

  return (
    <div className={styles.procurementCommandBar}>
      <div className={styles.commandCopy}>
        <Command aria-hidden size={16} />
        <span>Centro de control</span>
        <button onClick={onFocusSearch} type="button">
          <Keyboard aria-hidden size={14} />
          Ctrl K busqueda
        </button>
      </div>
      <div className={styles.commandActions}>
        {commands.map((command) =>
          command.to ? (
            <Link className={styles.commandButton} key={command.label} to={command.to}>
              <span>{command.label}</span>
              <kbd>{command.hint}</kbd>
            </Link>
          ) : (
            <button className={styles.commandButton} key={command.label} onClick={() => onTabChange(command.tab)} type="button">
              <span>{command.label}</span>
              <kbd>{command.hint}</kbd>
            </button>
          ),
        )}
        <button className={styles.commandButton} onClick={onClearSearch} type="button">
          <span>Limpiar foco</span>
          <kbd>Esc</kbd>
        </button>
      </div>
    </div>
  )
}

function ProcurementFocusFilters({
  onQueryChange,
  query,
}: {
  onQueryChange: (query: string) => void
  query: string
}) {
  const filters = [
    { label: 'Urgente', query: 'critical high urgente sin stock bajo minimo' },
    { label: 'Atrasado', query: 'atrasada atraso overdue vencida' },
    { label: 'Sin documento', query: 'documento pendiente bloqueada factura guia' },
    { label: 'Sobrestock', query: 'sobrestock sobrecompra no comprar' },
    { label: 'Proveedor riesgo', query: 'evitar revisar reclamo atrasada' },
  ]

  return (
    <div className={styles.focusFilterRail} aria-label="Filtros rapidos">
      {filters.map((filter) => (
        <button
          className={query === filter.query ? styles.focusFilterActive : undefined}
          key={filter.label}
          onClick={() => onQueryChange(query === filter.query ? '' : filter.query)}
          type="button"
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

function BulkActionBar({
  actions,
  helper,
  onClear,
  onSelectCritical,
  selectedCount,
  title,
  visibleCount,
}: {
  actions: string[]
  helper: string
  onClear: () => void
  onSelectCritical: () => void
  selectedCount: number
  title: string
  visibleCount: number
}) {
  return (
    <div className={styles.bulkActionBar}>
      <div>
        <strong>{title}</strong>
        <span>{selectedCount > 0 ? `${selectedCount} seleccionados de ${visibleCount}` : helper}</span>
      </div>
      <div className={styles.bulkActions}>
        <Button onClick={onSelectCritical} size="sm" type="button" variant="secondary">
          Seleccionar criticos
        </Button>
        {actions.map((action, index) => (
          <Button key={action} size="sm" type="button" variant={selectedCount > 0 && index === 0 ? 'primary' : 'secondary'}>
            {action}
          </Button>
        ))}
        <Button onClick={onClear} size="sm" type="button" variant="ghost">
          Limpiar
        </Button>
      </div>
    </div>
  )
}

function OperationalContextDrawer({
  context,
  onClose,
}: {
  context?: OperationalContext
  onClose: () => void
}) {
  if (!context) {
    return null
  }

  return (
    <DrawerPanel
      eyebrow={context.kind}
      footer={
        <>
          {context.href ? (
            <Link to={context.href}>
              <Button size="sm" variant="primary">
                Abrir detalle
              </Button>
            </Link>
          ) : null}
          <Button size="sm" type="button" variant="secondary">
            Crear tarea
          </Button>
          <Button size="sm" type="button" variant="secondary">
            Reasignar responsable
          </Button>
        </>
      }
      onClose={onClose}
      open={Boolean(context)}
      subtitle={context.subtitle}
      title={context.title}
    >
        <div className={styles.contextSummaryGrid}>
          {context.risk ? (
            <div>
              <span>Riesgo</span>
              <RiskBadge risk={context.risk} />
            </div>
          ) : null}
          {context.status ? (
            <div>
              <span>Estado</span>
              <StatusBadge>{context.status}</StatusBadge>
            </div>
          ) : null}
          {context.amount !== undefined ? (
            <div>
              <span>Monto</span>
              <strong>{formatCurrency(context.amount)}</strong>
            </div>
          ) : null}
        </div>
        <section className={styles.drawerRecommendation}>
          <strong>Por que importa</strong>
          <p>{context.impact}</p>
        </section>
        <section className={styles.drawerRecommendation}>
          <strong>Proxima accion</strong>
          <p>{context.action}</p>
        </section>
        {context.links?.length ? (
          <section className={styles.drawerRecommendation}>
            <strong>Contexto conectado</strong>
            <div className={styles.procurementTagList}>
              {context.links.map((link) => (
                <EntityLink id={link.id} key={`${link.type}-${link.id}`} type={link.type} variant="subtle">
                  {link.label}
                </EntityLink>
              ))}
            </div>
          </section>
        ) : null}
    </DrawerPanel>
  )
}

export function ProcurementCommandCenter({
  isLoading = false,
  parts = [],
  purchaseOrders,
  purchaseRequests = [],
  stockItems = [],
  suppliers = [],
}: ProcurementCommandCenterProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { clearSearch, matches, query, setQuery } = useSearch()
  const [selectedSku, setSelectedSku] = useState<string | undefined>()
  const [context, setContext] = useState<OperationalContext | undefined>()
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('Timeline operativo')
  const suggestionSelection = useSelection()
  const requestSelection = useSelection()
  const orderSelection = useSelection()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dashboard = useMemo(
    () => getProcurementDashboard({ parts, purchaseOrders, purchaseRequests, stockItems, suppliers }),
    [parts, purchaseOrders, purchaseRequests, stockItems, suppliers],
  )
  const requestedTab = searchParams.get('view') as ProcurementTab | null
  const activeTab = requestedTab && validTabs.has(requestedTab) ? requestedTab : 'dashboard'
  const setActiveTab = useCallback((tab: ProcurementTab) => {
    const nextParams = new URLSearchParams(searchParams)

    if (tab === 'dashboard') {
      nextParams.delete('view')
    } else {
      nextParams.set('view', tab)
    }

    setSearchParams(nextParams)
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isTyping = target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
        return
      }

      if (event.key === 'Escape') {
        if (context) {
          setContext(undefined)
          return
        }

        if (selectedSku) {
          setSelectedSku(undefined)
          return
        }

        clearSearch()
        return
      }

      if (!event.altKey || isTyping) {
        return
      }

      const key = event.key.toLowerCase()
      const shortcutTabs: Record<string, ProcurementTab> = {
        a: 'audit',
        p: 'suppliers',
        r: 'receipts',
        s: 'requests',
      }

      if (key === 'o') {
        event.preventDefault()
        navigate(ROUTES.purchaseOrderNew)
        return
      }

      if (shortcutTabs[key]) {
        event.preventDefault()
        setActiveTab(shortcutTabs[key])
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearSearch, context, navigate, selectedSku, setActiveTab])
  const selectedSkuProfile = dashboard.skuCoverage.find((profile) => profile.sku === selectedSku)
  const suggestions = dashboard.suggestions.filter(matches)
  const requests = dashboard.requests.filter(matches)
  const orders = dashboard.purchaseOrders.filter(matches)
  const receipts = dashboard.receipts.filter(matches)
  const stockHealth = dashboard.stockHealth.filter(matches)
  const supplierRows = dashboard.suppliers.filter(matches)
  const buyers = dashboard.buyerPerformance.filter(matches)
  const audit = dashboard.auditAlerts.filter(matches)
  const categories = dashboard.categories.filter(matches)
  const documents = dashboard.documents.filter(matches)
  const calendar = dashboard.calendar.filter(matches)
  const calendarEvents = filterCalendarEventsByMode(calendar, calendarMode)
  const urgentSuggestions = dashboard.suggestions.filter((item) => item.group === 'buy-now' || item.risk === 'critical' || item.risk === 'high')
  const pendingRequests = dashboard.requests.filter((item) => ['Detectada', 'En revision', 'Aprobada'].includes(item.state))
  const riskyOrders = dashboard.purchaseOrders.filter((item) => item.overdueDays > 0 || item.risk === 'critical' || item.risk === 'high')
  const pendingReceipts = dashboard.receipts.filter((item) => item.status !== 'Cerrada')
  const openAuditAlerts = dashboard.auditAlerts.filter((item) => item.status !== 'Cerrada' && item.status !== 'Corregida')
  const pendingDocuments = dashboard.documents.filter((item) => !['Completo', 'OK', 'Sin diferencia'].includes(item.documentState))
  const tabCounts: Record<ProcurementTab, number> = {
    audit: openAuditAlerts.length,
    buyers: dashboard.buyerPerformance.filter((item) => item.alerts.length > 0 || item.overduePurchaseOrders > 0).length,
    calendar: dashboard.calendar.length,
    categories: dashboard.categories.filter((item) => item.criticalSkus > 0 || item.deadSkus > 0 || item.overstockSkus > 0).length,
    dashboard: dashboard.blockers.length,
    documents: pendingDocuments.length,
    orders: riskyOrders.length,
    receipts: pendingReceipts.length,
    reports: dashboard.kpis.length,
    requests: pendingRequests.length,
    skus: dashboard.skuCoverage.length,
    stock: dashboard.stockHealth.filter((item) => item.state !== 'Disponible util').length,
    suggestions: urgentSuggestions.length,
    suppliers: dashboard.suppliers.filter((item) => item.recommendation !== 'Conveniente').length,
  }
  const visibleCounts: Record<ProcurementTab, number> = {
    audit: audit.length,
    buyers: buyers.length,
    calendar: calendarEvents.length,
    categories: categories.length,
    dashboard: dashboard.blockers.filter(matches).length,
    documents: documents.length,
    orders: orders.length,
    receipts: receipts.length,
    reports: dashboard.kpis.length,
    requests: requests.length,
    skus: suggestions.length > 0 ? suggestions.length : dashboard.suggestions.length,
    stock: stockHealth.length,
    suggestions: suggestions.length,
    suppliers: supplierRows.length,
  }
  const activeGuide = {
    audit: {
      action: 'Pedir justificacion o corregir la OC con mayor severidad.',
      now: `${openAuditAlerts.length} alertas abiertas`,
      why: 'Evita sobrecostos, duplicidad y compras sin demanda.',
    },
    buyers: {
      action: 'Reasignar solicitudes criticas y revisar compras fuera de politica.',
      now: `${tabCounts.buyers} responsables con alertas`,
      why: 'Muestra quien genera atraso, urgencia o sobrestock.',
    },
    calendar: {
      action: 'Priorizar eventos de alto riesgo y confirmar ETA.',
      now: `${dashboard.calendar.length} eventos programados`,
      why: 'Ordena llegadas, quiebres y solicitudes por fecha.',
    },
    categories: {
      action: 'Ajustar minimo/maximo y proveedor por categoria critica.',
      now: `${tabCounts.categories} categorias con riesgo`,
      why: 'Controla capital inmovilizado y quiebres por familia.',
    },
    dashboard: {
      action: 'Resolver primero el bloqueo con mayor impacto operacional.',
      now: `${dashboard.blockers.length} bloqueos operacionales`,
      why: 'Une caso, SKU, OC, proveedor y responsable.',
    },
    documents: {
      action: 'Bloquear cierre o asociar documento pendiente.',
      now: `${pendingDocuments.length} documentos por revisar`,
      why: 'Reduce diferencias OC vs factura vs recepcion.',
    },
    orders: {
      action: 'Reclamar proveedor, recibir parcial o cambiar fecha prometida.',
      now: `${riskyOrders.length} OC con riesgo`,
      why: 'Las OC atrasadas frenan casos y camiones.',
    },
    receipts: {
      action: 'Registrar recepcion parcial, diferencia o producto danado.',
      now: `${pendingReceipts.length} recepciones pendientes`,
      why: 'Lo comprado no sirve hasta quedar recibido y ubicado.',
    },
    reports: {
      action: 'Filtrar por categoria, proveedor o comprador y crear tarea.',
      now: `${dashboard.kpis.length} indicadores ejecutivos`,
      why: 'Convierte inventario y compras en control financiero.',
    },
    requests: {
      action: 'Aprobar, ajustar cantidad o rechazar con motivo.',
      now: `${pendingRequests.length} solicitudes pendientes`,
      why: 'Evita compras innecesarias antes de emitir OC.',
    },
    skus: {
      action: 'Abrir ficha 360 y validar cobertura, OC activa o sustitutos.',
      now: `${dashboard.skuCoverage.length} fichas SKU`,
      why: 'Concentra stock, consumo, precio, proveedor y demanda.',
    },
    stock: {
      action: 'Separar disponible, bloqueado, muerto y critico.',
      now: `${tabCounts.stock} SKUs con stock problematico`,
      why: 'Distingue stock usable de capital detenido.',
    },
    suggestions: {
      action: 'Convertir en solicitud u OC solo si la justificacion aplica.',
      now: `${urgentSuggestions.length} sugerencias urgentes`,
      why: 'Decide que comprar hoy y que no duplicar.',
    },
    suppliers: {
      action: 'Comparar proveedor por SKU antes de emitir la OC.',
      now: `${tabCounts.suppliers} proveedores a revisar`,
      why: 'Expone precio, cumplimiento y lead time real.',
    },
  }[activeTab]
  const priorityQueueItems = [
    { helper: 'sin stock, bajo minimo o demanda activa', label: 'Comprar hoy', tab: 'suggestions' as const, tone: 'danger' as const, value: urgentSuggestions.length },
    { helper: 'pendientes de aprobar o ajustar', label: 'Validar solicitudes', tab: 'requests' as const, tone: 'warning' as const, value: pendingRequests.length },
    { helper: 'atrasadas o con diferencia', label: 'Seguir OC', tab: 'orders' as const, tone: 'danger' as const, value: riskyOrders.length },
    { helper: 'parciales, danadas o sin documento', label: 'Recibir compras', tab: 'receipts' as const, tone: 'info' as const, value: pendingReceipts.length },
    { helper: 'compras sin demanda o fuera de politica', label: 'Auditar riesgos', tab: 'audit' as const, tone: 'warning' as const, value: openAuditAlerts.length },
  ]
  const inspectBlocker = (blocker: OperationalBlocker) => {
    setContext({
      action: blocker.quickAction,
      amount: blocker.affectedAmount,
      href: blocker.relatedEntity?.type === 'purchaseOrder' ? ROUTES.purchaseOrderDetail(blocker.relatedEntity.id) : undefined,
      impact: blocker.impact,
      kind: `Bloqueo ${blocker.type}`,
      links: blocker.relatedEntity ? [blocker.relatedEntity] : [],
      status: blocker.type,
      subtitle: blocker.nextAction,
      title: blocker.blocker,
    })
  }
  const inspectDocument = (document: DocumentControlItem) => {
    setContext({
      action: document.action,
      amount: document.amount,
      href: ROUTES.purchaseOrderDetail(document.purchaseOrderId),
      impact: document.difference,
      kind: 'Control documental',
      links: [
        { id: document.purchaseOrderId, label: document.purchaseOrderNumber, type: 'purchaseOrder' },
        { id: document.supplierId, label: document.supplierName, type: 'supplier' },
      ],
      risk: document.risk,
      status: document.documentState,
      subtitle: `Vence ${formatDate(document.dueDate)}`,
      title: document.purchaseOrderNumber,
    })
  }
  const inspectReceipt = (receipt: PurchaseReceipt) => {
    const missingQuantity = Math.max(0, receipt.orderedQuantity - receipt.receivedQuantity)

    setContext({
      action: receipt.action,
      href: ROUTES.purchaseOrderDetail(receipt.purchaseOrderId),
      impact: missingQuantity > 0 ? `${missingQuantity} unidades faltantes bloquean disponibilidad.` : 'Recepcion lista para dejar stock disponible.',
      kind: 'Recepcion de compra',
      links: [
        { id: receipt.purchaseOrderId, label: receipt.purchaseOrderNumber, type: 'purchaseOrder' },
        { id: receipt.supplierId, label: receipt.supplierName, type: 'supplier' },
        { id: receipt.sku, label: receipt.sku, type: 'sku' },
        { id: receipt.locationCode, label: receipt.locationCode, type: 'warehouseLocation' },
      ],
      status: receipt.status,
      subtitle: `${receipt.receivedQuantity}/${receipt.orderedQuantity} recibidas. Documento: ${receipt.documentStatus}.`,
      title: receipt.purchaseOrderNumber,
    })
  }
  const inspectAuditAlert = (alert: typeof audit[number]) => {
    setContext({
      action: alert.action,
      amount: alert.amount,
      href: alert.relatedEntity?.type === 'purchaseOrder' ? ROUTES.purchaseOrderDetail(alert.relatedEntity.id) : undefined,
      impact: alert.impact,
      kind: 'Alerta de auditoria',
      links: alert.relatedEntity ? [alert.relatedEntity] : [],
      risk: alert.severity,
      status: alert.status,
      subtitle: alert.reason,
      title: alert.alert,
    })
  }
  const inspectCalendarEvent = (event: ReplenishmentCalendarEvent) => {
    setContext({
      action: getCalendarAction(event),
      href: event.purchaseOrderId ? ROUTES.purchaseOrderDetail(event.purchaseOrderId) : undefined,
      impact: getCalendarEventExplanation(event),
      kind: 'Calendario de abastecimiento',
      links: event.relatedEntity ? [event.relatedEntity] : [],
      risk: event.risk,
      status: event.type,
      subtitle: `${formatDate(event.date)} ${formatTime(event.date)} - Responsable: ${event.responsible}`,
      title: event.title,
    })
  }

  return (
    <div className={styles.procurementShell} aria-busy={isLoading}>
      <Card>
        <div className={styles.procurementHero}>
          <div>
            <span className="muted-text">Flujo operacional</span>
            <h2>Demanda detectada {'>'} decision {'>'} OC {'>'} recepcion {'>'} stock actualizado {'>'} auditoria</h2>
            <p>{activeGuide.now}. {activeGuide.action}</p>
          </div>
          <label className={styles.procurementSearch}>
            <span>Busqueda global</span>
            <input
              ref={searchInputRef}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="SKU, OC, proveedor, comprador, categoria, caso, camion o ubicacion"
              type="search"
              value={query}
            />
          </label>
        </div>
      </Card>

      <ProcurementCommandBar
        onClearSearch={clearSearch}
        onFocusSearch={() => searchInputRef.current?.focus()}
        onTabChange={setActiveTab}
      />
      <ProcurementFocusFilters onQueryChange={setQuery} query={query} />
      <ProcurementPriorityQueue items={priorityQueueItems} onTabChange={setActiveTab} />
      <ProcurementFlowNav activeTab={activeTab} counts={tabCounts} onTabChange={setActiveTab} />
      <ActiveViewGuide
        action={activeGuide.action}
        activeTab={activeTab}
        count={visibleCounts[activeTab]}
        now={activeGuide.now}
        why={activeGuide.why}
      />

      {activeTab === 'dashboard' ? (
        <div className={styles.procurementStack}>
          <div className={styles.operationalKpiGrid}>
            {dashboard.kpis.map((kpi) => (
              <OperationalKpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
          <Card>
            <div className="stack">
              <SectionHeader
                description="Responde que esta bloqueando la operacion, por que importa, cuanto dinero compromete y que accion tomar."
                title="Bloqueos operacionales"
              />
              <BlockersTable onInspect={inspectBlocker} rows={dashboard.blockers.filter(matches)} />
            </div>
          </Card>
          <div className={styles.procurementGrid}>
            <Card>
              <div className="stack">
                <SectionHeader
                  description="Acciones inmediatas sugeridas por riesgo operacional y financiero."
                  title="Proxima accion recomendada"
                />
                <div className={styles.actionGrid}>
                  {procurementPrimaryActions.map((action) => (
                    <Link className={styles.actionCard} key={action.label} to={action.to}>
                      <div className={styles.actionHeader}>
                        <strong>{action.label}</strong>
                        <ActionBadge>Actuar</ActionBadge>
                      </div>
                      <span>{action.helper}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
            <Card>
              <div className="stack">
                <SectionHeader
                  description="SKUs que pueden generar quiebre, sobrecompra o duplicidad."
                  title="Decisiones criticas de hoy"
                />
                <div className={styles.reportList}>
                  {dashboard.suggestions.slice(0, 5).map((suggestion) => (
                    <div className={styles.reportRow} key={suggestion.id}>
                      <div className={styles.rowMain}>
                        <EntityLink id={suggestion.partId} type="part">
                          {suggestion.sku}
                        </EntityLink>
                        <span>{suggestion.justification}</span>
                      </div>
                      <div className={styles.reportValue}>
                        <RiskBadge risk={suggestion.risk} />
                        <strong>{getSuggestionGroupLabel(suggestion.group)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {activeTab === 'suggestions' ? (
        <Card>
          <div className="stack">
            <SectionHeader
              description="Comprar ahora, revisar, esperar recepcion, no comprar o frenar sobrecompra con justificacion explicita."
              title="Decision de compra"
            />
            <BulkActionBar
              actions={['Convertir en OC', 'Comparar proveedores', 'Rechazar con motivo']}
              helper="Selecciona sugerencias para convertir, comparar o frenar en una sola operacion."
              onClear={suggestionSelection.clear}
              onSelectCritical={() => suggestionSelection.replace(suggestions.filter((item) => item.risk === 'critical' || item.risk === 'high').map((item) => item.id))}
              selectedCount={suggestionSelection.selectedCount}
              title="Acciones masivas de reposicion"
              visibleCount={suggestions.length}
            />
            <PurchaseSuggestionTable
              onOpenSku={setSelectedSku}
              onSelectionChange={suggestionSelection.replace}
              rows={suggestions}
              selectedIds={suggestionSelection.selectedIds}
            />
          </div>
        </Card>
      ) : null}

      {activeTab === 'requests' ? (
        <Card>
          <div className="stack">
            <SectionHeader
              description="Detecta solicitudes innecesarias, cantidades excesivas, duplicadas y pendientes de aprobacion."
              title="Solicitudes de compra"
            />
            <BulkActionBar
              actions={['Aprobar seleccion', 'Asignar comprador', 'Agrupar solicitud']}
              helper="Trabaja solicitudes repetidas o urgentes sin abrir una por una."
              onClear={requestSelection.clear}
              onSelectCritical={() => requestSelection.replace(requests.filter((item) => item.risk === 'critical' || item.risk === 'high').map((item) => item.id))}
              selectedCount={requestSelection.selectedCount}
              title="Bandeja rapida de solicitudes"
              visibleCount={requests.length}
            />
            <PurchaseRequestTable
              onSelectionChange={requestSelection.replace}
              rows={requests}
              selectedIds={requestSelection.selectedIds}
            />
          </div>
        </Card>
      ) : null}

      {activeTab === 'orders' ? (
        <Card>
          <div className="stack">
            <SectionHeader
              description="Seguimiento de OC con recepcion, documentos, atrasos, duplicidad y trazabilidad operacional."
              title="Ordenes de compra"
            />
            <BulkActionBar
              actions={['Reclamar proveedor', 'Actualizar fecha', 'Registrar recepcion']}
              helper="Selecciona OC atrasadas o bloqueadas para gestionarlas en lote."
              onClear={orderSelection.clear}
              onSelectCritical={() => orderSelection.replace(orders.filter((item) => item.risk === 'critical' || item.risk === 'high').map((item) => item.purchaseOrderId))}
              selectedCount={orderSelection.selectedCount}
              title="Seguimiento masivo de OC"
              visibleCount={orders.length}
            />
            <SupplyPurchaseOrderTable
              onSelectionChange={orderSelection.replace}
              rows={orders}
              selectedIds={orderSelection.selectedIds}
            />
          </div>
        </Card>
      ) : null}

      {activeTab === 'receipts' ? (
        <Card>
          <div className="stack">
            <SectionHeader
              description="Controla si lo comprado llego completo, llego bien, quedo documentado y se puso disponible."
              title="Recepcion de compra"
            />
            <ReceiptTable onInspect={inspectReceipt} rows={receipts} />
          </div>
        </Card>
      ) : null}

      {activeTab === 'skus' ? (
        <div className={styles.procurementStack}>
          <Card>
            <div className="stack">
              <SectionHeader
                description="Ficha operativa por SKU con cobertura, precio, proveedor, OC activa, sustitutos e impacto en taller."
                title="SKUs / Catalogo 360"
              />
              <PurchaseSuggestionTable onOpenSku={setSelectedSku} rows={suggestions.length > 0 ? suggestions : dashboard.suggestions} />
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === 'stock' ? (
        <Card>
          <div className="stack">
            <SectionHeader
              description="Separa stock sano de stock bloqueado, lento, muerto, critico, en transito o con diferencia."
              title="Salud del stock fisico"
            />
            <div className={styles.inventorySummaryStrip}>
              {getProcurementSummaryMetrics(dashboard.stockHealth).map((metric) => (
                <div className={[styles.inventorySummaryItem, styles[metric.tone]].join(' ')} key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.helper}</small>
                </div>
              ))}
            </div>
            <StockHealthTable rows={stockHealth} />
          </div>
        </Card>
      ) : null}

      {activeTab === 'suppliers' ? (
        <div className={styles.procurementStack}>
          <Card>
            <div className="stack">
              <SectionHeader
                description="Decide a quien comprar segun precio, lead time real, cumplimiento, reclamos y OC abiertas."
                title="Proveedores"
              />
              <SuppliersTable rows={supplierRows} />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <SectionHeader description="Comparacion de proveedores por SKU con precio, lead time y cumplimiento." title="Comparar proveedor por SKU" />
              <SupplierComparisonTable rows={dashboard.supplierSkuComparison.filter(matches)} />
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === 'buyers' ? (
        <div className={styles.procurementStack}>
          <div className={styles.buyerGrid}>
            {buyers.map((buyer) => (
              <BuyerPerformanceCard buyer={buyer} key={buyer.buyerId} />
            ))}
          </div>
          <Card>
            <div className="stack">
              <SectionHeader description="Ranking para detectar cumplimiento, sobrestock, urgencias y compras fuera de sugerencia." title="Ranking de responsables" />
              <div className={styles.reportList}>
                {getBuyerRankingRows(dashboard.buyerPerformance).map((row) => (
                  <div className={styles.reportRow} key={row.label}>
                    <div className={styles.rowMain}>
                      <strong>{row.label}</strong>
                      <Link to={`${ROUTES.warehouseManagers}?buyer=${encodeURIComponent(row.buyer.buyerName)}`}>{row.buyer.buyerName}</Link>
                    </div>
                    <div className={styles.reportValue}>
                      <span>{row.metric}</span>
                      <strong>{row.action}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === 'audit' ? (
        <Card>
          <div className="stack">
            <SectionHeader
              description="Detecta compras sin demanda, sobre maximo, duplicadas, caras, tardias, sin documento o fuera de sugerencia."
              title="Auditoria de compras"
            />
            <AuditAlertTable onInspect={inspectAuditAlert} rows={audit} />
          </div>
        </Card>
      ) : null}

      {activeTab === 'reports' ? (
        <div className={styles.procurementStack}>
          <Card>
            <div className="stack">
              <SectionHeader
                description="Indicadores accionables por categoria, SKU, proveedor, comprador, ubicacion, estado de OC, alerta y periodo."
                title="Reporte ejecutivo"
              />
              <div className={styles.reportGrid}>
                {[...dashboard.kpis, ...getProcurementSummaryMetrics(dashboard.stockHealth)].map((metric) => (
                  <div className={[styles.reportMetric, styles[metric.tone]].join(' ')} key={metric.label}>
                    <small>{metric.label}</small>
                    <strong>{metric.value}</strong>
                    <span className="muted-text">{metric.helper}</span>
                  </div>
                ))}
              </div>
              <div className={styles.quickLinks}>
                <Button size="sm" type="button" variant="secondary">Exportar</Button>
                <Button size="sm" type="button" variant="secondary">Crear tarea</Button>
                <Button size="sm" type="button" variant="secondary">Crear solicitud</Button>
                <Button size="sm" type="button" variant="secondary">Seguir OC</Button>
              </div>
            </div>
          </Card>
          <Card>
            <div className="stack">
              <SectionHeader description="Lectura por categoria para capital, quiebres, sobrestock y comprador responsable." title="Control por categoria" />
              <CategoryTable rows={categories} />
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === 'categories' ? (
        <Card>
          <div className="stack">
            <SectionHeader
              description="Muestra consumo, margen operacional, quiebres, stock inmovilizado, responsables y riesgo por categoria."
              title="Control por categoria"
            />
            <CategoryTable rows={categories} />
          </div>
        </Card>
      ) : null}

      {activeTab === 'calendar' ? (
        <Card>
          <div className="stack">
            <SectionHeader
              description="Muestra que llega, que se atrasa, que puede quebrar stock y quien debe actuar. Primero atiende riesgo, despues confirma recepcion."
              title="Calendario de abastecimiento"
            />
            <CalendarOverview events={calendarEvents} onInspect={inspectCalendarEvent} />
            <div className={styles.statusSegment}>
              {calendarModes.map((mode) => (
                <button
                  aria-pressed={calendarMode === mode}
                  className={calendarMode === mode ? styles.statusSegmentActive : undefined}
                  key={mode}
                  onClick={() => setCalendarMode(mode)}
                  type="button"
                >
                  <span>{mode}</span>
                  <strong>{getCalendarModeCount(calendar, mode)}</strong>
                </button>
              ))}
            </div>
            <CalendarPriorityBoard events={calendarEvents} onInspect={inspectCalendarEvent} />
            <CalendarTimeline onInspect={inspectCalendarEvent} rows={calendarEvents} />
          </div>
        </Card>
      ) : null}

      {activeTab === 'documents' ? (
        <Card>
          <div className="stack">
            <SectionHeader
              description="Factura, guia, respaldo, aprobacion y diferencias OC vs factura vs recepcion con bloqueo de cierre."
              title="Control de documentos"
            />
            <DocumentsTable onInspect={inspectDocument} rows={documents} />
          </div>
        </Card>
      ) : null}

      <Sku360Drawer onClose={() => setSelectedSku(undefined)} profile={selectedSkuProfile} />
      <OperationalContextDrawer context={context} onClose={() => setContext(undefined)} />
    </div>
  )
}
