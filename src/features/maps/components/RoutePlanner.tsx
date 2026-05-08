import { useEffect, useId, useMemo, useState } from 'react'
import { LocateFixed, MapPinned } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { calculateRoute, searchPlaces } from '../services/maps.service'
import type { MapPlaceSuggestion, MapRouteResult } from '../types/maps.types'
import { FrontendRouteMap } from './FrontendRouteMap'
import styles from './RoutePlanner.module.css'

type AddressField = 'origin' | 'destination'

interface RoutePlannerProps {
  className?: string
  defaultDestination?: string
  defaultKm?: number
  defaultOrigin?: string
  hiddenFields?: boolean
  onRouteChange?: (route: MapRouteResult | null) => void
}

export function RoutePlanner({
  className = '',
  defaultDestination = '',
  defaultKm = 0,
  defaultOrigin = '',
  hiddenFields = true,
  onRouteChange,
}: RoutePlannerProps) {
  const originId = useId()
  const destinationId = useId()
  const sessionToken = useMemo(() => `route-${originId}-${destinationId}`.replace(/[^a-zA-Z0-9_-]/g, ''), [destinationId, originId])
  const [originQuery, setOriginQuery] = useState(defaultOrigin)
  const [destinationQuery, setDestinationQuery] = useState(defaultDestination)
  const [originSelection, setOriginSelection] = useState<MapPlaceSuggestion | null>(null)
  const [destinationSelection, setDestinationSelection] = useState<MapPlaceSuggestion | null>(null)
  const [originSuggestions, setOriginSuggestions] = useState<MapPlaceSuggestion[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<MapPlaceSuggestion[]>([])
  const [activeField, setActiveField] = useState<AddressField | null>(null)
  const [route, setRoute] = useState<MapRouteResult | null>(null)
  const [routeError, setRouteError] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false)
  const [isSearchingDestination, setIsSearchingDestination] = useState(false)
  const [manualKm, setManualKm] = useState(defaultKm > 0 ? String(defaultKm) : '')
  const canCalculate = originQuery.trim().length >= 3 && destinationQuery.trim().length >= 3 && !isCalculating
  const estimatedKm = route?.distanceKm || Number(manualKm || 0)
  const originAddress = route?.origin.formattedAddress || originQuery.trim()
  const destinationAddress = route?.destination.formattedAddress || destinationQuery.trim()
  const classNames = [styles.routePlanner, className].filter(Boolean).join(' ')

  useEffect(() => {
    const selectedText = originSelection?.description || route?.origin.formattedAddress || ''
    let ignore = false

    if (originQuery.trim().length < 3 || originQuery === selectedText) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      searchPlaces(originQuery, sessionToken)
        .then((suggestions) => {
          if (!ignore) {
            setOriginSuggestions(suggestions)
          }
        })
        .catch(() => {
          if (!ignore) {
            setOriginSuggestions([])
          }
        })
        .finally(() => {
          if (!ignore) {
            setIsSearchingOrigin(false)
          }
        })
    }, 280)

    return () => {
      ignore = true
      window.clearTimeout(timeout)
    }
  }, [originQuery, originSelection?.description, route?.origin.formattedAddress, sessionToken])

  useEffect(() => {
    const selectedText = destinationSelection?.description || route?.destination.formattedAddress || ''
    let ignore = false

    if (destinationQuery.trim().length < 3 || destinationQuery === selectedText) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      searchPlaces(destinationQuery, sessionToken)
        .then((suggestions) => {
          if (!ignore) {
            setDestinationSuggestions(suggestions)
          }
        })
        .catch(() => {
          if (!ignore) {
            setDestinationSuggestions([])
          }
        })
        .finally(() => {
          if (!ignore) {
            setIsSearchingDestination(false)
          }
        })
    }, 280)

    return () => {
      ignore = true
      window.clearTimeout(timeout)
    }
  }, [destinationQuery, destinationSelection?.description, route?.destination.formattedAddress, sessionToken])

  const routeMetrics = useMemo(
    () => [
      {
        label: 'Kilometraje',
        value: route?.distanceText || (estimatedKm > 0 ? `${estimatedKm.toLocaleString('es-CL')} km` : 'Pendiente'),
      },
      {
        label: 'Tiempo ruta',
        value: route?.durationText || 'Pendiente',
      },
      {
        label: 'Peajes ruta',
        value: formatTolls(route),
      },
      {
        label: 'Origen validado',
        value: buildAddressMeta(route?.origin) || 'Sin validar',
      },
      {
        label: 'Destino validado',
        value: buildAddressMeta(route?.destination) || 'Sin validar',
      },
    ],
    [estimatedKm, route],
  )

  const handleSelectSuggestion = (field: AddressField, suggestion: MapPlaceSuggestion) => {
    setRoute(null)
    onRouteChange?.(null)
    setRouteError('')
    setManualKm('')

    if (field === 'origin') {
      setOriginSelection(suggestion)
      setOriginQuery(suggestion.description)
      setOriginSuggestions([])
      return
    }

    setDestinationSelection(suggestion)
    setDestinationQuery(suggestion.description)
    setDestinationSuggestions([])
  }

  const handleCalculateRoute = async () => {
    if (!canCalculate) {
      return
    }

    setIsCalculating(true)
    setRouteError('')

    try {
      const nextRoute = await calculateRoute({
        destination: destinationSelection
          ? { address: destinationQuery.trim(), placeId: destinationSelection.placeId }
          : destinationQuery.trim(),
        origin: originSelection ? { address: originQuery.trim(), placeId: originSelection.placeId } : originQuery.trim(),
      })

      setRoute(nextRoute)
      setManualKm(String(nextRoute.distanceKm))
      setOriginQuery(nextRoute.origin.formattedAddress || originQuery)
      setDestinationQuery(nextRoute.destination.formattedAddress || destinationQuery)
      onRouteChange?.(nextRoute)
    } catch (error) {
      setRoute(null)
      setRouteError(getApiErrorMessage(error))
      onRouteChange?.(null)
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className={classNames}>
      {hiddenFields ? (
        <>
          <input name="originAddress" type="hidden" value={originAddress} />
          <input name="destinationAddress" type="hidden" value={destinationAddress} />
          <input name="estimatedKm" type="hidden" value={estimatedKm || ''} />
        </>
      ) : null}
      <div className={styles.header}>
        <div className={styles.title}>
          <strong>Ruta operativa</strong>
          <span>Busca direcciones reales, valida codigo postal cuando este disponible y calcula kilometraje desde backend.</span>
        </div>
        <span className={styles.statusBadge}>
          <MapPinned aria-hidden size={15} />
          {route ? `Ruta validada - ${getRouteProviderLabel(route.provider)}` : 'Origen / destino'}
        </span>
      </div>
      <div className={styles.addressGrid}>
        <AddressAutocompleteField
          active={activeField === 'origin'}
          id={originId}
          isSearching={isSearchingOrigin}
          label="Origen"
          onFocus={() => setActiveField('origin')}
          onInput={(value) => {
            setRoute(null)
            setRouteError('')
            setManualKm('')
            setOriginSelection(null)
            setOriginSuggestions([])
            setIsSearchingOrigin(value.trim().length >= 3)
            setOriginQuery(value)
          }}
          onSelect={(suggestion) => handleSelectSuggestion('origin', suggestion)}
          placeholder="Escribe bodega, calle, comuna o punto de retiro"
          suggestions={originSuggestions}
          value={originQuery}
        />
        <AddressAutocompleteField
          active={activeField === 'destination'}
          id={destinationId}
          isSearching={isSearchingDestination}
          label="Destino"
          onFocus={() => setActiveField('destination')}
          onInput={(value) => {
            setRoute(null)
            setRouteError('')
            setManualKm('')
            setDestinationSelection(null)
            setDestinationSuggestions([])
            setIsSearchingDestination(value.trim().length >= 3)
            setDestinationQuery(value)
          }}
          onSelect={(suggestion) => handleSelectSuggestion('destination', suggestion)}
          placeholder="Escribe cliente, direccion o zona de entrega"
          suggestions={destinationSuggestions}
          value={destinationQuery}
        />
      </div>
      <div className={styles.routeActions}>
        <label className={styles.manualKm}>
          <span>Km operativo</span>
          <input
            min={0}
            onChange={(event) => {
              setManualKm(event.target.value)
              setRoute(null)
              onRouteChange?.(null)
            }}
            placeholder="Se calcula desde backend"
            step="0.1"
            type="number"
            value={manualKm}
          />
        </label>
        <Button disabled={!canCalculate} icon={<LocateFixed size={17} />} onClick={handleCalculateRoute} type="button">
          {isCalculating ? 'Calculando...' : 'Calcular ruta'}
        </Button>
      </div>
      {routeError ? <p className={styles.errorText}>{routeError}. Puedes registrar km operativo manual si necesitas continuar.</p> : null}
      <div className={styles.routePreview}>
        <FrontendRouteMap
          className={styles.frontendMap}
          destinationLabel={destinationAddress}
          error={routeError}
          isLoading={isCalculating}
          originLabel={originAddress}
          route={route}
        />
        <div className={styles.routeMetrics}>
          {routeMetrics.map((metric) => (
            <div className={styles.metric} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
        <p className={styles.helperText}>
          {route
            ? `Distancia calculada por ${getRouteProviderLabel(route.provider)}. El formulario guarda direcciones normalizadas y kilometraje operativo.`
            : 'El backend usa Google Maps si esta configurado; si no, usa OpenStreetMap/OSRM para que la distancia siga funcionando sin cuenta.'}
        </p>
      </div>
    </div>
  )
}

interface AddressAutocompleteFieldProps {
  active: boolean
  id: string
  isSearching: boolean
  label: string
  onFocus: () => void
  onInput: (value: string) => void
  onSelect: (suggestion: MapPlaceSuggestion) => void
  placeholder: string
  suggestions: MapPlaceSuggestion[]
  value: string
}

function AddressAutocompleteField({
  active,
  id,
  isSearching,
  label,
  onFocus,
  onInput,
  onSelect,
  placeholder,
  suggestions,
  value,
}: AddressAutocompleteFieldProps) {
  return (
    <label className={styles.addressField} htmlFor={id}>
      <span>{label}</span>
      <input
        autoComplete="off"
        id={id}
        onChange={(event) => onInput(event.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        value={value}
      />
      {active && (suggestions.length > 0 || isSearching) ? (
        <div className={styles.suggestions}>
          {isSearching ? <p className={styles.helperText}>Buscando coincidencias...</p> : null}
          {suggestions.map((suggestion) => (
            <button
              className={styles.suggestionButton}
              key={suggestion.placeId}
              onMouseDown={(event) => {
                event.preventDefault()
                onSelect(suggestion)
              }}
              type="button"
            >
              <strong>{suggestion.mainText}</strong>
              <span>{suggestion.secondaryText || suggestion.description}</span>
            </button>
          ))}
          <p className={styles.helperText}>{buildSuggestionsProviderLabel(suggestions)}</p>
        </div>
      ) : null}
    </label>
  )
}

function buildAddressMeta(address?: MapRouteResult['origin']) {
  if (!address) {
    return ''
  }

  return [address.postalCode, address.city, address.region].filter(Boolean).join(' - ')
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

  return 'mapas'
}

function buildSuggestionsProviderLabel(suggestions: MapPlaceSuggestion[]) {
  const hasGoogle = suggestions.some((suggestion) => suggestion.provider === 'google')
  const hasOpenMaps = suggestions.some((suggestion) => suggestion.provider === 'nominatim')

  if (hasGoogle && hasOpenMaps) {
    return 'Google Maps / OpenStreetMap'
  }

  if (hasGoogle) {
    return 'Google Maps'
  }

  if (hasOpenMaps) {
    return 'OpenStreetMap'
  }

  return 'Buscador de direcciones'
}
