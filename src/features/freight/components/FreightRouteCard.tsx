import { useEffect, useState } from 'react'
import { Flag, Gauge, MapPin, Navigation, Package, Timer } from 'lucide-react'
import { Card } from '../../../shared/components/Card/Card'
import { formatDate } from '../../../shared/utils/formatDate'
import { FrontendRouteMap } from '../../maps/components/FrontendRouteMap'
import { calculateRoute } from '../../maps/services/maps.service'
import type { MapRouteResult } from '../../maps/types/maps.types'
import { CARGO_TYPE_LABELS } from '../constants/cargoType.constants'
import type { FreightRequest } from '../types/freight.types'
import styles from './FreightModule.module.css'

interface FreightRouteCardProps {
  request: FreightRequest
}

export function FreightRouteCard({ request }: FreightRouteCardProps) {
  const routeKey = `${request.originAddress}|${request.destinationAddress}`
  const [routeState, setRouteState] = useState<{
    error: string
    key: string
    route: MapRouteResult | null
  }>({ error: '', key: '', route: null })
  const route = routeState.key === routeKey ? routeState.route : null
  const routeError = routeState.key === routeKey ? routeState.error : ''
  const isLoadingRoute = Boolean(request.originAddress && request.destinationAddress && routeState.key !== routeKey)
  const distanceKm = route?.distanceKm || request.estimatedKm
  const drivingMinutes = route?.durationSeconds ? Math.max(1, Math.round(route.durationSeconds / 60)) : Math.max(30, Math.round((distanceKm / 58) * 60))
  const pickupMinutes = request.requiresLoadingHelp ? 75 : 45
  const deliveryMinutes = request.requiresUnloadingHelp ? 75 : 35
  const waitingMinutes = request.requiresWaitingTime ? Math.round((request.waitingHours || 1) * 60) : 0
  const totalMinutes = drivingMinutes + pickupMinutes + deliveryMinutes + waitingMinutes
  const originAddress = route?.origin.formattedAddress || request.originAddress
  const destinationAddress = route?.destination.formattedAddress || request.destinationAddress
  const routeProviderLabel = getRouteProviderLabel(route?.provider)
  const routeSource = route ? `Validada con ${routeProviderLabel}` : routeError ? 'Referencia manual' : 'Calculando en backend'
  const routeStops = [
    request.requiresLoadingHelp ? 'Carga asistida' : 'Retiro directo',
    request.requiresWaitingTime ? `Espera ${request.waitingHours || 1}h` : 'Sin espera',
    request.requiresUnloadingHelp ? 'Descarga asistida' : 'Entrega directa',
  ]

  useEffect(() => {
    let ignore = false

    if (!request.originAddress || !request.destinationAddress) {
      return undefined
    }

    calculateRoute({
      destination: request.destinationAddress,
      origin: request.originAddress,
    })
      .then((nextRoute) => {
        if (!ignore) {
          setRouteState({ error: '', key: routeKey, route: nextRoute })
        }
      })
      .catch((error) => {
        if (!ignore) {
          setRouteState({
            error: error instanceof Error ? error.message : 'No se pudo validar la ruta.',
            key: routeKey,
            route: null,
          })
        }
      })

    return () => {
      ignore = true
    }
  }, [request.destinationAddress, request.originAddress, routeKey])

  return (
    <Card className={styles.routeMapCard}>
      <div className={styles.routeMapHeader}>
        <div className={styles.routeMapTitle}>
          <h2>Ruta GPS cotizada</h2>
          <p>Vista operacional para primera milla: retiro, transito, ventanas de espera y entrega.</p>
        </div>
        <div className={styles.routeKpis}>
          <span className={styles.routeKpi}>
            <Navigation aria-hidden size={15} />
            {distanceKm.toLocaleString('es-CL')} km
          </span>
          <span className={styles.routeKpi}>
            <Timer aria-hidden size={15} />
            {formatDuration(totalMinutes)}
          </span>
          <span className={styles.routeKpi}>
            <Gauge aria-hidden size={15} />
            {Math.round(distanceKm / Math.max(drivingMinutes / 60, 1))} km/h ruta
          </span>
          <span className={styles.routeKpi}>
            <MapPin aria-hidden size={15} />
            {formatTolls(route)}
          </span>
        </div>
      </div>
      <FrontendRouteMap
        className={styles.freightFrontendMap}
        destinationLabel={destinationAddress}
        error={routeError}
        isLoading={isLoadingRoute}
        originLabel={originAddress}
        route={route}
      />
      <div className={styles.routeControlStrip}>
        <span>{routeSource}</span>
        <strong>{routeStops.join(' / ')}</strong>
      </div>
      <div className={styles.routeInsights}>
        <div className={styles.routeInsight}>
          <span>Ventana retiro</span>
          <strong>{request.requestedPickupDate ? formatDate(request.requestedPickupDate) : 'Por coordinar'}</strong>
        </div>
        <div className={styles.routeInsight}>
          <span>Carga</span>
          <strong>{CARGO_TYPE_LABELS[request.cargoType]}</strong>
        </div>
        <div className={styles.routeInsight}>
          <span>Peso / volumen</span>
          <strong>
            {request.weightKg || 0} kg / {request.volumeM3 || 0} m3
          </strong>
        </div>
        <div className={styles.routeInsight}>
          <span>Ruta</span>
          <strong>{route?.durationText || routeSource}</strong>
        </div>
        <div className={styles.routeInsight}>
          <span>Peajes</span>
          <strong>{formatTolls(route)}</strong>
        </div>
        <div className={styles.routeInsight}>
          <span>Servicio</span>
          <strong>{request.requiresLoadingHelp || request.requiresUnloadingHelp ? 'Con apoyo operativo' : 'Directo'}</strong>
        </div>
      </div>
      <dl className="detail-list">
        <div>
          <dt>
            <MapPin aria-hidden size={14} /> Origen
          </dt>
          <dd>{originAddress}</dd>
        </div>
        <div>
          <dt>
            <Flag aria-hidden size={14} /> Destino
          </dt>
          <dd>{destinationAddress}</dd>
        </div>
        <div>
          <dt>
            <Package aria-hidden size={14} /> Descripcion
          </dt>
          <dd>{request.cargoDescription}</dd>
        </div>
      </dl>
    </Card>
  )
}

function formatTolls(route: MapRouteResult | null) {
  if (!route?.tolls?.hasTolls) {
    return route?.provider === 'google' ? 'Sin peajes detectados' : 'No disponible sin Google'
  }

  if (!route.tolls.priceKnown) {
    return 'Peaje sin precio'
  }

  return route.tolls.totalAmount.toLocaleString('es-CL', {
    currency: route.tolls.currencyCode || 'CLP',
    maximumFractionDigits: 0,
    style: 'currency',
  })
}

function getRouteProviderLabel(provider?: MapRouteResult['provider']) {
  if (provider === 'google') {
    return 'Google Maps'
  }

  if (provider === 'osrm') {
    return 'OpenStreetMap / OSRM'
  }

  if (provider === 'fallback') {
    return 'estimacion operacional'
  }

  return 'backend'
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) {
    return `${minutes} min`
  }

  if (minutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${minutes} min`
}
