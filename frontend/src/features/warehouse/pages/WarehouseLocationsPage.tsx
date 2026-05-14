import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { InventoryModuleNav } from '../components/InventoryModuleNav'
import { InventorySummaryStrip } from '../components/InventorySummaryStrip'
import styles from '../components/InventoryModule.module.css'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { LocationForm } from '../components/LocationForm'
import { LocationTable } from '../components/LocationTable'
import { warehouseLocationsMock, warehouseStockMock } from '../mocks/warehouse.mock'
import { deleteWarehouseLocation } from '../services/warehouseLocations.service'
import type { WarehouseLocation } from '../types/warehouse.types'

export function WarehouseLocationsPage() {
  const [savedLocations, setSavedLocations] = useState<WarehouseLocation[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null)
  const [locationPendingDeletion, setLocationPendingDeletion] = useState<WarehouseLocation | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { data: warehouseLocationsData } = useResourceList<WarehouseLocation>(
    '/warehouse/locations',
    warehouseLocationsMock,
    { order: 'asc', sort: 'code' },
  )

  const warehouseLocations = useMemo(() => {
    const savedById = new Map(savedLocations.map((location) => [location.id, location]))

    return [
      ...warehouseLocationsData.filter((location) => !deletedIds.includes(location.id) && !savedById.has(location.id)),
      ...savedLocations.filter((location) => !deletedIds.includes(location.id)),
    ].sort((first, second) => first.code.localeCompare(second.code))
  }, [deletedIds, savedLocations, warehouseLocationsData])

  const activeLocations = warehouseLocations.filter((location) => location.status === 'active').length
  const alertLocations = warehouseLocations.filter((location) => ['full', 'maintenance'].includes(location.status)).length
  const totalCapacity = warehouseLocations.reduce((total, location) => total + location.capacity, 0)
  const usedUnits = warehouseStockMock
    .filter((stockItem) => warehouseLocations.some((location) => location.id === stockItem.locationId))
    .reduce((total, stockItem) => total + stockItem.quantity, 0)

  const handleSaved = (location: WarehouseLocation) => {
    setSavedLocations((current) => [
      location,
      ...current.filter((item) => item.id !== location.id),
    ])
    setDeletedIds((current) => current.filter((id) => id !== location.id))
    setSelectedLocation(null)
    setIsEditorOpen(false)
    setErrorMessage('')
  }

  const handleCreate = () => {
    setSelectedLocation(null)
    setIsEditorOpen(true)
    setErrorMessage('')
  }

  const handleEdit = (location: WarehouseLocation) => {
    setSelectedLocation(location)
    setIsEditorOpen(true)
    setErrorMessage('')
  }

  const handleDelete = async (location: WarehouseLocation) => {
    setLocationPendingDeletion(location)
  }

  const confirmDelete = async () => {
    if (!locationPendingDeletion) {
      return
    }

    setDeletingId(locationPendingDeletion.id)
    setErrorMessage('')

    try {
      await deleteWarehouseLocation(locationPendingDeletion.id)
      setDeletedIds((current) => Array.from(new Set([...current, locationPendingDeletion.id])))
      setSelectedLocation((current) => (current?.id === locationPendingDeletion.id ? null : current))
      setIsEditorOpen((current) => (selectedLocation?.id === locationPendingDeletion.id ? false : current))
      setLocationPendingDeletion(null)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setDeletingId('')
    }
  }

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <Button icon={<Plus size={16} />} onClick={handleCreate} size="sm" type="button">
              Crear bodega
            </Button>
          }
          description="Zonas, pasillos, estantes y niveles conectados a stock fisico, retiros y capacidad."
          title="Ubicaciones de bodega"
        />
        <InventoryModuleNav />
        <InventorySummaryStrip
          items={[
            { helper: 'zonas operativas', label: 'Ubicaciones', tone: 'neutral', value: warehouseLocations.length },
            { helper: 'disponibles para retiro', label: 'Activas', tone: 'success', value: activeLocations },
            { helper: 'llenas o en mantencion', label: 'En alerta', tone: alertLocations > 0 ? 'warning' : 'neutral', value: alertLocations },
            { helper: `${usedUnits} unidades ocupadas`, label: 'Capacidad total', tone: 'info', value: totalCapacity },
          ]}
        />
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo eliminar la bodega" /> : null}
        <div className={isEditorOpen ? styles.inventoryEditorLayout : undefined}>
          <Card className={styles.primaryQueue}>
            <div className="stack">
              <SectionHeader
                description="Selecciona una ubicacion para editarla. La creacion queda disponible solo cuando la necesitas."
                title="Mapa de ubicaciones"
              />
              <LocationTable
                deletingId={deletingId}
                locations={warehouseLocations}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          </Card>
          {isEditorOpen ? (
            <Card className={styles.editorPanel}>
              <div className="stack">
                <SectionHeader
                  description={
                    selectedLocation
                      ? 'Actualiza ruta fisica, capacidad, estado y auditoria de modificacion.'
                      : 'Crea una bodega operativa con ruta fisica y capacidad trazable.'
                  }
                  title={selectedLocation ? `Editar ${selectedLocation.code}` : 'Crear bodega'}
                />
                <LocationForm
                  location={selectedLocation}
                  onCancel={() => {
                    setSelectedLocation(null)
                    setIsEditorOpen(false)
                  }}
                  onSaved={handleSaved}
                />
              </div>
            </Card>
          ) : null}
        </div>
        <ConfirmModal
          confirmLabel="Eliminar bodega"
          description={
            locationPendingDeletion
              ? `La ubicacion ${locationPendingDeletion.code} dejara de aparecer en el mapa operativo.`
              : undefined
          }
          isConfirming={Boolean(deletingId)}
          onCancel={() => setLocationPendingDeletion(null)}
          onConfirm={confirmDelete}
          open={Boolean(locationPendingDeletion)}
          title="Eliminar ubicacion"
          tone="danger"
        />
      </div>
    </PageContainer>
  )
}
