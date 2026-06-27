import { RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { useFuelPrice } from '../hooks/useFuelPrice'
import type { FuelPriceSnapshot } from '../types/fuel.types'
import styles from './FuelModule.module.css'

interface FuelPriceStatusCardProps {
  compact?: boolean
  onPriceLoaded?: (snapshot: FuelPriceSnapshot) => void
}

export function FuelPriceStatusCard({ compact = false, onPriceLoaded }: FuelPriceStatusCardProps) {
  const { errorMessage, fuelPrice, isLoading, isSyncing, refresh } = useFuelPrice()

  useEffect(() => {
    if (fuelPrice && onPriceLoaded) {
      onPriceLoaded(fuelPrice)
    }
  }, [fuelPrice, onPriceLoaded])

  // Hay un precio real (scraping web) cuando el snapshot esta OK y trae valor.
  // Si no, mostramos el fallback estatico como "Referencial".
  const hasLivePrice = fuelPrice?.status === 'OK' && (fuelPrice?.pricePerLiter ?? 0) > 0
  const statusTone = hasLivePrice ? 'success' : 'warning'
  const badgeLabel = hasLivePrice ? 'Web en vivo' : 'Referencial'
  const lastFetched = fuelPrice?.lastFetchedAt ? formatDate(fuelPrice.lastFetchedAt) : 'Sin actualizar'
  const rawWarning = errorMessage || fuelPrice?.errorMessage || ''
  const warning = hasLivePrice ? '' : rawWarning || 'Precio referencial: no se pudo obtener un valor en vivo.'

  return (
    <Card className={compact ? styles.priceStatusCompact : styles.priceStatusCard}>
      <div className={styles.priceStatusHeader}>
        <div>
          <p className={styles.label}>Precio petroleo (diesel)</p>
          <h2>{fuelPrice ? `${formatCurrency(fuelPrice.pricePerLiter)} / L` : isLoading ? 'Cargando...' : 'No disponible'}</h2>
        </div>
        <Badge tone={statusTone}>{badgeLabel}</Badge>
      </div>
      <div className={styles.priceStatusMeta}>
        <span>{fuelPrice?.source || 'preciocombustible.cl'}</span>
        <span>{fuelPrice?.regionName || 'Chile (promedio nacional)'}</span>
        <span>Ultima actualizacion: {lastFetched}</span>
      </div>
      {warning ? <p className={styles.priceStatusWarning}>{warning}</p> : null}
      <div className={styles.priceStatusActions}>
        <Button
          icon={<RefreshCw size={16} />}
          loading={isSyncing}
          disabled={isLoading}
          onClick={() => void refresh(true)}
          size="sm"
          type="button"
          variant="secondary"
        >
          Actualizar precio
        </Button>
        <span className={styles.muted}>Actualizacion automatica diaria a las 06:00 (hora Chile).</span>
      </div>
    </Card>
  )
}
