import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Cloud, ExternalLink, MapPin, RefreshCw, Server, Smartphone } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
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

function osmEmbedUrl(position: GpsPosition) {
  const d = 0.04
  const bbox = [position.lng - d, position.lat - d, position.lng + d, position.lat + d].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${position.lat},${position.lng}`
}

function osmLink(position: GpsPosition) {
  return `https://www.openstreetmap.org/?mlat=${position.lat}&mlon=${position.lng}#map=15/${position.lat}/${position.lng}`
}

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

export function LiveGpsPanel() {
  const [positions, setPositions] = useState<GpsPosition[]>(gpsPositionsMock)
  const [isLoading, setIsLoading] = useState(true)
  const [source, setSource] = useState<GpsSource>('demo')
  const [fetchedAt, setFetchedAt] = useState('')
  const [selectedPlate, setSelectedPlate] = useState('')
  const [reloadIndex, setReloadIndex] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    fetchLastPositions(controller.signal)
      .then((result) => {
        if (!active) {
          return
        }
        const next = result.positions.length > 0 ? result.positions : gpsPositionsMock
        setPositions(next)
        setSource(result.positions.length > 0 ? 'live' : 'demo')
        setFetchedAt(result.fetchedAt)
      })
      .catch((requestError) => {
        if (active && requestError?.name !== 'CanceledError' && requestError?.name !== 'AbortError') {
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

  const selected = useMemo(
    () => positions.find((position) => position.plate === selectedPlate) || positions[0],
    [positions, selectedPlate],
  )

  const moving = positions.filter((position) => position.speed > 0).length
  const enginesOn = positions.filter((position) => position.engineOn).length

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
    { key: 'movement', header: 'Estado', render: (position) => movementBadge(position), sortValue: (position) => position.speed },
    {
      key: 'fixedAt',
      header: 'Ultima senal',
      render: (position) => (position.fixedAt ? formatDate(position.fixedAt) : '-'),
      sortValue: (position) => position.fixedAt,
    },
    {
      key: 'map',
      header: 'Mapa',
      render: (position) => (
        <a
          aria-label={`Ver ${position.plate} en el mapa`}
          href={osmLink(position)}
          onClick={(event) => event.stopPropagation()}
          rel="noreferrer"
          target="_blank"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <ExternalLink aria-hidden size={14} /> Ver
        </a>
      ),
    },
  ]

  return (
    <Card>
      <div className="stack">
        <SectionHeader
          actions={
            <Button icon={<RefreshCw size={16} />} loading={isLoading} onClick={refresh} size="sm" type="button" variant="secondary">
              Actualizar
            </Button>
          }
          description={`Posicion real de la flota via DS-TMS${fetchedAt ? ` - actualizado ${formatDate(fetchedAt)}` : ''}`}
          meta={
            <Badge tone={source === 'live' ? 'success' : 'warning'}>
              {source === 'live' ? 'En vivo (DS-TMS)' : 'Datos demo (sin backend)'}
            </Badge>
          }
          title="Posicion en vivo (GPS)"
        />

        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <MetricCard label="Moviles" tone="info" value={positions.length} helper="con senal GPS" />
          <MetricCard label="En movimiento" tone="success" value={moving} helper="velocidad > 0" />
          <MetricCard label="Motor encendido" tone="warning" value={enginesOn} helper="detenidos con motor" />
          <MetricCard label="Detenidos" tone="neutral" value={positions.length - moving} helper="velocidad 0" />
        </div>

        <div className="surface-panel stack-tight">
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <MapPin aria-hidden size={15} /> Como se conecta el GPS
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
            posicion real. Endpoints: <code>GET /api/gps/last-position</code> y <code>GET /api/gps/history</code>.
          </p>
        </div>

        {selected ? (
          <div className="stack-tight">
            <div className="split-row">
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MapPin aria-hidden size={15} /> {selected.plate} - {selected.location || 'ubicacion desconocida'}
              </strong>
              <a href={osmLink(selected)} rel="noreferrer" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ExternalLink aria-hidden size={14} /> Abrir mapa completo
              </a>
            </div>
            <iframe
              key={selected.plate}
              title={`Mapa GPS ${selected.plate}`}
              src={osmEmbedUrl(selected)}
              style={{ width: '100%', height: 320, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
              loading="lazy"
            />
            <p className="muted-text">Selecciona una fila de la tabla para centrar el mapa en ese movil.</p>
          </div>
        ) : null}

        <Table
          columns={columns}
          data={positions}
          emptyLabel="Sin posiciones"
          emptyDescription="La flota no reporta posiciones en este momento."
          getRowKey={(position) => position.plate}
          getSearchText={(position) => `${position.plate} ${position.location}`}
          isLoading={isLoading}
          loadingLabel="Consultando GPS de la flota"
          onRowClick={(position) => setSelectedPlate(position.plate)}
          searchPlaceholder="Buscar por patente o ubicacion"
        />
      </div>
    </Card>
  )
}
