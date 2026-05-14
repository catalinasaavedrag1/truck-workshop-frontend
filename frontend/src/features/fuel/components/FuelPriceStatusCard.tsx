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

  const statusTone = fuelPrice?.isOfficial ? 'success' : 'warning'
  const lastFetched = fuelPrice?.lastFetchedAt ? formatDate(fuelPrice.lastFetchedAt) : 'Sin sincronizar'

  return (
    <Card className={compact ? styles.priceStatusCompact : styles.priceStatusCard}>
      <div className={styles.priceStatusHeader}>
        <div>
          <p className={styles.label}>Precio petroleo</p>
          <h2>{fuelPrice ? formatCurrency(fuelPrice.pricePerLiter) : isLoading ? 'Cargando...' : 'No disponible'}</h2>
        </div>
        <Badge tone={statusTone}>{fuelPrice?.isOfficial ? 'CNE oficial' : 'Fallback'}</Badge>
      </div>
      <div className={styles.priceStatusMeta}>
        <span>{fuelPrice?.source || 'CNE / Energia Abierta'}</span>
        <span>{fuelPrice?.regionName || 'Region Metropolitana'}</span>
        <span>Ultima consulta: {lastFetched}</span>
        {fuelPrice?.minutesUntilNextSync !== undefined ? <span>Proxima revision: {fuelPrice.minutesUntilNextSync} min</span> : null}
      </div>
      {errorMessage || fuelPrice?.errorMessage ? (
        <p className={styles.priceStatusWarning}>{errorMessage || fuelPrice?.errorMessage}</p>
      ) : null}
      <div className={styles.priceStatusActions}>
        <Button
          disabled={isLoading || isSyncing}
          icon={<RefreshCw size={16} />}
          onClick={() => void refresh(true)}
          size="sm"
          type="button"
          variant="secondary"
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar CNE'}
        </Button>
        <span className={styles.muted}>Cache automatico cada {fuelPrice?.syncIntervalMinutes || 15} min.</span>
      </div>
    </Card>
  )
}
