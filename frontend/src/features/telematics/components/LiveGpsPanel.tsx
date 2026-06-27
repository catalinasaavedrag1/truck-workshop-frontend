import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowRight, Cloud, RefreshCw, Satellite, Server, Smartphone } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import { gpsPositionsMock } from '../mocks/gpsPositions.mock'
import { fetchLastPositions } from '../services/gpsTracking.service'
import type { GpsPosition } from '../services/gpsTracking.service'

type GpsSource = 'live' | 'demo'

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
  { key: 'plate', header: 'Patente', render: (position) => <strong>{position.plate}</strong>, sortValue: (position) => position.plate },
  {
    key: 'location',
    header: 'Ubicacion',
    render: (position) => <span className="muted-text">{position.location || 'Sin referencia'}</span>,
  },
  { key: 'movement', header: 'Estado', render: (position) => movementBadge(position), sortValue: (position) => position.speed },
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

const flowStepStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 10px',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  background: '#f9fbfc',
  fontSize: '0.8rem',
  fontWeight: 700,
}

/**
 * Panel GPS: muestra la posicion en vivo de la flota (proxy backend -> DS-TMS).
 * Incluye un bloque didactico que explica la conexion, y cae a datos de
 * demostracion cuando no hay backend (ej. GitHub Pages), siempre indicando la fuente.
 */
export function LiveGpsPanel() {
  const [positions, setPositions] = useState<GpsPosition[]>(gpsPositionsMock)
  const [isLoading, setIsLoading] = useState(true)
  const [source, setSource] = useState<GpsSource>('demo')
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
        setPositions(result.positions.length > 0 ? result.positions : gpsPositionsMock)
        setSource(result.positions.length > 0 ? 'live' : 'demo')
        setFetchedAt(result.fetchedAt)
      })
      .catch((requestError) => {
        if (active && requestError?.name !== 'CanceledError' && requestError?.name !== 'AbortError') {
          // Sin backend (ej. Pages): mostramos datos de demostracion.
          setPositions(gpsPositionsMock)
          setSource('demo')
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
            <Button icon={<RefreshCw size={16} />} loading={isLoading} onClick={refresh} size="sm" type="button" variant="secondary">
              Actualizar
            </Button>
          }
          description={`${positions.length} moviles - ${moving} en movimiento${fetchedAt ? ` - actualizado ${formatDate(fetchedAt)}` : ''}`}
          meta={
            <Badge tone={source === 'live' ? 'success' : 'warning'}>
              {source === 'live' ? 'En vivo (DS-TMS)' : 'Datos demo (sin backend)'}
            </Badge>
          }
          title="Posicion en vivo (GPS)"
        />

        <div className="surface-panel stack-tight">
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Satellite aria-hidden size={15} /> Como se conecta el GPS
          </strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span style={flowStepStyle}>
              <Smartphone aria-hidden size={14} /> App
            </span>
            <ArrowRight aria-hidden size={15} />
            <span style={flowStepStyle}>
              <Server aria-hidden size={14} /> Backend (proxy, tokens server-side)
            </span>
            <ArrowRight aria-hidden size={15} />
            <span style={flowStepStyle}>
              <Cloud aria-hidden size={14} /> DS-TMS GPS
            </span>
          </div>
          <p className="muted-text">
            La app pide al backend; el backend consulta DS-TMS con los tokens (que nunca llegan al navegador) y entrega la
            posicion normalizada. Endpoints: <code>GET /api/gps/last-position</code> y{' '}
            <code>GET /api/gps/history</code> (historial por patente). En el demo publico, sin backend, se muestran datos de
            ejemplo.
          </p>
        </div>

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
      </div>
    </Card>
  )
}
