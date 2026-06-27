import { useEffect, useState } from 'react'
import { RefreshCw, Satellite } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatDate } from '../../../shared/utils/formatDate'
import { fetchLastPositions } from '../services/gpsTracking.service'
import type { GpsPosition } from '../services/gpsTracking.service'

function movementBadge(position: GpsPosition) {
  if (position.speed > 0) {
    return <Badge tone="success">En movimiento ({position.speed} km/h)</Badge>
  }
  if (position.engineOn) {
    return <Badge tone="warning">Motor encendido</Badge>
  }
  return <Badge tone="neutral">Detenido</Badge>
}

const columns: TableColumn<GpsPosition>[] = [
  {
    key: 'plate',
    header: 'Patente',
    render: (position) => <strong>{position.plate}</strong>,
    sortValue: (position) => position.plate,
  },
  {
    key: 'location',
    header: 'Ubicacion',
    render: (position) => <span className="muted-text">{position.location || 'Sin referencia'}</span>,
  },
  {
    key: 'movement',
    header: 'Estado',
    render: (position) => movementBadge(position),
    sortValue: (position) => position.speed,
  },
  {
    key: 'fixedAt',
    header: 'Ultima senal',
    render: (position) => (position.fixedAt ? formatDate(position.fixedAt) : '-'),
    sortValue: (position) => position.fixedAt,
  },
  {
    key: 'odometerKm',
    header: 'Odometro',
    align: 'right',
    render: (position) => `${position.odometerKm.toLocaleString('es-CL')} km`,
    sortValue: (position) => position.odometerKm,
  },
  {
    key: 'voltage',
    header: 'Voltaje',
    align: 'right',
    render: (position) => `${position.voltage.toFixed(1)} V`,
    sortValue: (position) => position.voltage,
  },
]

export function LiveGpsPanel() {
  const [positions, setPositions] = useState<GpsPosition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [fetchedAt, setFetchedAt] = useState('')
  const [reloadIndex, setReloadIndex] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    fetchLastPositions(controller.signal)
      .then((result) => {
        if (!active) {
          return
        }
        setPositions(result.positions)
        setFetchedAt(result.fetchedAt)
        setError('')
      })
      .catch((requestError) => {
        if (active && requestError?.name !== 'CanceledError' && requestError?.name !== 'AbortError') {
          setError(getApiErrorMessage(requestError))
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [reloadIndex])

  const refresh = () => {
    setIsLoading(true)
    setReloadIndex((current) => current + 1)
  }

  const moving = positions.filter((position) => position.speed > 0).length

  return (
    <Card>
      <div className="stack">
        <SectionHeader
          actions={
            <Button
              icon={<RefreshCw size={16} />}
              loading={isLoading}
              onClick={refresh}
              size="sm"
              type="button"
              variant="secondary"
            >
              Actualizar
            </Button>
          }
          description={
            error
              ? 'Posicion en tiempo real de la flota (DS-TMS).'
              : `${positions.length} moviles - ${moving} en movimiento${fetchedAt ? ` - actualizado ${formatDate(fetchedAt)}` : ''}`
          }
          meta={<Satellite aria-hidden size={16} />}
          title="Posicion en vivo (GPS)"
        />
        {error ? (
          <ErrorState
            action={
              <Button onClick={refresh} size="sm" type="button" variant="secondary">
                Reintentar
              </Button>
            }
            description={`No se pudo obtener la posicion en vivo: ${error}`}
            title="GPS no disponible"
          />
        ) : (
          <Table
            columns={columns}
            data={positions}
            emptyLabel="Sin posiciones"
            emptyDescription="La flota no reporta posiciones en este momento."
            getRowKey={(position) => position.plate}
            getSearchText={(position) => `${position.plate} ${position.location}`}
            isLoading={isLoading}
            loadingLabel="Consultando GPS de la flota"
            searchPlaceholder="Buscar por patente o ubicacion"
          />
        )}
      </div>
    </Card>
  )
}
