import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import {
  Keyboard,
  Menu,
  MoreHorizontal,
  Search,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { appConfig } from '../../../config/app.config'
import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
import { customersMock } from '../../../features/customers/mocks/customers.mock'
import { purchaseOrdersMock } from '../../../features/purchase-orders/mocks/purchaseOrders.mock'
import { driversMock } from '../../../features/drivers/mocks/drivers.mock'
import { fleetTrucksMock } from '../../../features/fleet/mocks/fleet.mock'
import { freightRequestsMock } from '../../../features/freight/mocks/freight.mock'
import { incidentsMock } from '../../../features/incidents/mocks/incidents.mock'
import { NotificationCenterButton } from '../../../features/notifications/components/NotificationCenterButton'
import { tirePerformanceMock } from '../../../features/tire-performance/mocks/tirePerformance.mock'
import { truckDocumentsMock } from '../../../features/truck-documents/mocks/truckDocuments.mock'
import { operationalQuickActions } from '../../shortcuts/quickActions.config'
import type { ShortcutPreferences } from '../../shortcuts/shortcutPreferences.types'
import { formatShortcutLabel, getQuickActionShortcut, getQuickActionShortcutRange } from '../../shortcuts/shortcutUtils'
import { getSidebarIcon } from '../Sidebar/sidebarIcons'
import styles from './Topbar.module.css'

interface SearchItem {
  id: string
  label: string
  meta: string
  path: string
  type: string
  keywords: string
}

interface TopbarProps {
  focusSearchSignal?: number
  isSidebarOpen: boolean
  isSidebarPinned: boolean
  onOpenShortcutHelp: () => void
  onToggleSidebar: () => void
  shortcutPreferences: ShortcutPreferences
}

export function Topbar({
  focusSearchSignal = 0,
  isSidebarOpen,
  isSidebarPinned,
  onOpenShortcutHelp,
  onToggleSidebar,
  shortcutPreferences,
}: TopbarProps) {
  const [query, setQuery] = useState('')
  const [showMoreShortcuts, setShowMoreShortcuts] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const visibleQuickActions = operationalQuickActions.slice(0, 4)
  const secondaryQuickActions = operationalQuickActions.slice(4)
  const searchShortcutLabel = shortcutPreferences.profile === 'apple'
    ? formatShortcutLabel('cmd+shift+k', shortcutPreferences.profile)
    : formatShortcutLabel('ctrl+shift+k', shortcutPreferences.profile)
  const quickActionRange = getQuickActionShortcutRange(shortcutPreferences, operationalQuickActions.length)

  const searchItems = useMemo<SearchItem[]>(
    () => [
      ...casesMock.map((workshopCase) => ({
        id: workshopCase.id,
        keywords: [
          workshopCase.caseNumber,
          workshopCase.truckPlate,
          workshopCase.customerName,
          workshopCase.driverName,
          workshopCase.failureDescription,
        ].join(' '),
        label: workshopCase.caseNumber,
        meta: `${workshopCase.customerName} · ${workshopCase.truckPlate}`,
        path: ROUTES.caseDetail(workshopCase.id),
        type: 'Caso',
      })),
      ...fleetTrucksMock.map((truck) => ({
        id: truck.id,
        keywords: [truck.plate, truck.brand, truck.model, truck.operationalStatus, truck.mainBlocker || ''].join(' '),
        label: truck.plate,
        meta: `${truck.brand} ${truck.model} - ${truck.operationalStatus}`,
        path: ROUTES.fleetTruckDetail(truck.id),
        type: 'Camion',
      })),
      ...driversMock.map((driver) => ({
        id: driver.id,
        keywords: [driver.name, driver.document, driver.company, driver.phone].join(' '),
        label: driver.name,
        meta: `${driver.company} · ${driver.document}`,
        path: ROUTES.driverDetail(driver.id),
        type: 'Chofer',
      })),
      ...customersMock.map((customer) => ({
        id: customer.id,
        keywords: [
          customer.name,
          customer.rut || '',
          customer.contactName || '',
          customer.email || '',
          customer.preferredOrigins.join(' '),
          customer.preferredDestinations.join(' '),
        ].join(' '),
        label: customer.name,
        meta: `${customer.contactName || 'Sin contacto'} - ${customer.creditEnabled ? 'credito' : 'sin credito'}`,
        path: ROUTES.customerDetail(customer.id),
        type: 'Cliente',
      })),
      ...purchaseOrdersMock.map((purchaseOrder) => ({
        id: purchaseOrder.id,
        keywords: [
          purchaseOrder.purchaseOrderNumber,
          purchaseOrder.supplierName,
          purchaseOrder.relatedCaseId || '',
        ].join(' '),
        label: purchaseOrder.purchaseOrderNumber,
        meta: `${purchaseOrder.supplierName} · ${purchaseOrder.status}`,
        path: ROUTES.purchaseOrderDetail(purchaseOrder.id),
        type: 'OC',
      })),
      ...freightRequestsMock.map((request) => ({
        id: request.id,
        keywords: [
          request.requestNumber,
          request.customerName,
          request.originAddress,
          request.destinationAddress,
          request.cargoDescription,
        ].join(' '),
        label: request.requestNumber,
        meta: `${request.customerName} · ${request.estimatedKm} km`,
        path: ROUTES.freightRequestDetail(request.id),
        type: 'Flete',
      })),
      ...tirePerformanceMock.map((tire) => ({
        id: tire.id,
        keywords: [
          tire.skuCode,
          tire.skuName,
          tire.brand,
          tire.model || '',
          tire.truckPlate || '',
          tire.supplierName,
        ].join(' '),
        label: tire.skuCode,
        meta: `${tire.brand} · ${tire.truckPlate || 'en stock'}`,
        path: ROUTES.tirePerformance,
        type: 'Neumatico',
      })),
      ...truckDocumentsMock.map((document) => ({
        id: document.id,
        keywords: [document.truckId, document.documentType, document.documentNumber || '', document.status].join(' '),
        label: document.documentNumber || document.documentType,
        meta: `${document.truckId} - ${document.status}`,
        path: ROUTES.truckDocumentDetail(document.id),
        type: 'Documento',
      })),
      ...incidentsMock.map((incident) => ({
        id: incident.id,
        keywords: [
          incident.incidentNumber,
          incident.truckId,
          incident.description,
          incident.location,
          incident.incidentType,
        ].join(' '),
        label: incident.incidentNumber,
        meta: `${incident.truckId} - ${incident.severity}`,
        path: ROUTES.incidentDetail(incident.id),
        type: 'Incidente',
      })),
    ],
    [],
  )

  const normalizedQuery = query.trim().toLowerCase()
  const results = normalizedQuery
    ? searchItems
        .filter((item) => item.keywords.toLowerCase().includes(normalizedQuery))
        .slice(0, 6)
    : []

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMoreShortcuts(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    if (!focusSearchSignal) {
      return
    }

    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    })
  }, [focusSearchSignal])

  return (
    <header className={styles.topbar}>
      <button
        aria-label={isSidebarOpen ? 'Colapsar menu lateral' : 'Desplegar menu lateral'}
        aria-pressed={isSidebarOpen}
        className={styles.menuButton}
        onClick={onToggleSidebar}
        title={isSidebarOpen ? 'Contraer menu lateral' : isSidebarPinned ? 'Abrir menu lateral' : 'Abrir menu lateral'}
        type="button"
      >
        <Menu size={20} />
      </button>
      <div className={styles.searchWrap}>
        <div className={styles.search}>
          <Search aria-hidden size={18} />
          <input
            aria-label="Buscar"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar caso, cliente, camion, chofer, OC o flete"
            ref={searchInputRef}
            type="search"
            value={query}
          />
          {shortcutPreferences.shortcutHintsEnabled ? <kbd>{searchShortcutLabel}</kbd> : null}
        </div>
        {results.length > 0 ? (
          <div className={styles.results}>
            {results.map((item) => (
              <Link className={styles.result} key={`${item.type}-${item.id}`} onClick={() => setQuery('')} to={item.path}>
                <span className={styles.resultType}>{item.type}</span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.meta}</small>
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      <nav aria-label="Atajos rapidos" className={styles.quickActions}>
        {shortcutPreferences.shortcutHintsEnabled ? (
          <span className={styles.quickActionMode} title={`Acciones rapidas ${quickActionRange}`}>
            {quickActionRange}
          </span>
        ) : null}
        {visibleQuickActions.map((action, index) => (
          <Link
            aria-label={`${action.label}. Atajo ${getQuickActionShortcut(index + 1, shortcutPreferences)}`}
            className={[styles.shortcutButton, index === 0 ? styles.primaryShortcut : ''].filter(Boolean).join(' ')}
            key={action.label}
            title={`${action.label} (${getQuickActionShortcut(index + 1, shortcutPreferences)})`}
            to={action.path}
          >
            {createElement(getSidebarIcon(action.icon), { 'aria-hidden': true, size: 17 })}
            <span className={styles.srOnly}>{action.label}</span>
            {shortcutPreferences.shortcutHintsEnabled ? <kbd>{index + 1}</kbd> : null}
          </Link>
        ))}
        {secondaryQuickActions.length > 0 ? (
          <div className={styles.moreWrap}>
            <button
              aria-expanded={showMoreShortcuts}
              aria-label="Ver mas atajos rapidos"
              className={styles.moreButton}
              onClick={() => setShowMoreShortcuts((current) => !current)}
              type="button"
            >
              <MoreHorizontal aria-hidden size={18} />
            </button>
            {showMoreShortcuts ? (
              <div className={styles.moreMenu}>
                {secondaryQuickActions.map((action, offset) => (
                  <Link
                    aria-label={`${action.label}. Atajo ${getQuickActionShortcut(visibleQuickActions.length + offset + 1, shortcutPreferences)}`}
                    className={styles.moreAction}
                    key={action.label}
                    onClick={() => setShowMoreShortcuts(false)}
                    title={`${action.label} (${getQuickActionShortcut(visibleQuickActions.length + offset + 1, shortcutPreferences)})`}
                    to={action.path}
                  >
                    {createElement(getSidebarIcon(action.icon), { 'aria-hidden': true, size: 17 })}
                    <span>{action.label}</span>
                    {shortcutPreferences.shortcutHintsEnabled ? (
                      <kbd>{getQuickActionShortcut(visibleQuickActions.length + offset + 1, shortcutPreferences)}</kbd>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </nav>
      <div className={styles.actions}>
        <button
          aria-label="Ver atajos de teclado"
          className={styles.iconButton}
          onClick={onOpenShortcutHelp}
          title="Ver atajos de teclado (?)"
          type="button"
        >
          <Keyboard aria-hidden size={18} />
        </button>
        <NotificationCenterButton />
        <div className={styles.profile}>
          <UserRound aria-hidden size={18} />
          <span>{appConfig.company}</span>
        </div>
      </div>
    </header>
  )
}
