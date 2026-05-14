import { DrawerPanel } from '../../../shared/components/DrawerPanel/DrawerPanel'
import { EntityLink } from '../../../shared/components/EntityLink'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { SkuCoverage } from '../types/procurement.types'
import { StatusBadge } from './ProcurementBadges'
import styles from './InventoryModule.module.css'

interface Sku360DrawerProps {
  onClose: () => void
  profile?: SkuCoverage
}

export function Sku360Drawer({ onClose, profile }: Sku360DrawerProps) {
  if (!profile) {
    return null
  }

  return (
    <DrawerPanel
      eyebrow="Ficha 360 SKU"
      onClose={onClose}
      open={Boolean(profile)}
      size="lg"
      subtitle={`${profile.category} - ${profile.rotation} rotacion`}
      title={profile.sku}
    >
        <div className={styles.drawerGrid}>
          <section>
            <h3>Stock y cobertura</h3>
            <dl>
              <div><dt>Fisico</dt><dd>{profile.stockPhysical}</dd></div>
              <div><dt>Disponible</dt><dd>{profile.stockAvailable}</dd></div>
              <div><dt>Reservado</dt><dd>{profile.reservedStock}</dd></div>
              <div><dt>Bloqueado</dt><dd>{profile.blockedStock}</dd></div>
              <div><dt>En transito</dt><dd>{profile.inTransitStock}</dd></div>
              <div><dt>Cobertura</dt><dd>{profile.coverageDays} dias</dd></div>
            </dl>
          </section>

          <section>
            <h3>Compra e historial</h3>
            <dl>
              <div><dt>Ultimo proveedor</dt><dd>{profile.lastProvider}</dd></div>
              <div><dt>Ultimo precio</dt><dd>{formatCurrency(profile.lastPrice)}</dd></div>
              <div><dt>Precio promedio</dt><dd>{formatCurrency(profile.priceAverage)}</dd></div>
              <div><dt>Historico</dt><dd>{profile.priceHistory}</dd></div>
              <div><dt>Quiebres historicos</dt><dd>{profile.historicalBreaks}</dd></div>
            </dl>
          </section>

          <section>
            <h3>Operacion asociada</h3>
            <div className={styles.procurementTagList}>
              {profile.cases.map((workshopCase) => (
                <EntityLink id={workshopCase.id} key={workshopCase.id} type={workshopCase.type} variant="subtle">
                  {workshopCase.label}
                </EntityLink>
              ))}
              {profile.trucks.map((truck) => (
                <EntityLink id={truck.id} key={truck.id} type={truck.type} variant="subtle">
                  {truck.label}
                </EntityLink>
              ))}
              <EntityLink id={profile.locationCode} type="warehouseLocation" variant="subtle">
                {profile.locationCode}
              </EntityLink>
            </div>
          </section>

          <section>
            <h3>Proveedores y sustitutos</h3>
            <div className={styles.procurementTagList}>
              {profile.supplierAlternatives.map((supplier) => (
                <StatusBadge key={supplier}>{supplier}</StatusBadge>
              ))}
              {profile.substitutes.map((substitute) => (
                <EntityLink id={substitute} key={substitute} type="sku" variant="subtle">
                  {substitute}
                </EntityLink>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.drawerRecommendation}>
          <strong>Recomendacion de compra</strong>
          <p>{profile.recommendation}</p>
          {profile.activePurchaseOrderNumber ? <StatusBadge>{profile.activePurchaseOrderNumber}</StatusBadge> : null}
        </div>
    </DrawerPanel>
  )
}
