import { useMemo, useState } from 'react'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { InventoryModuleNav } from '../components/InventoryModuleNav'
import styles from '../components/InventoryModule.module.css'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { LocationForm } from '../components/LocationForm'
import { LocationTable } from '../components/LocationTable'
import { warehouseLocationsMock } from '../mocks/warehouse.mock'
import { deleteWarehouseLocation } from '../services/warehouseLocations.service'
import type { WarehouseLocation } from '../types/warehouse.types'

export function WarehouseLocationsPage() {
  const [savedLocations, setSavedLocations] = useState<WarehouseLocation[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null)
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

  const handleSaved = (location: WarehouseLocation) => {
    setSavedLocations((current) => [
      location,
      ...current.filter((item) => item.id !== location.id),
    ])
    setDeletedIds((current) => current.filter((id) => id !== location.id))
    setSelectedLocation(null)
    setErrorMessage('')
  }

  const handleDelete = async (location: WarehouseLocation) => {
    if (!window.confirm(`Eliminar bodega ${location.code}?`)) {
      return
    }

    setDeletingId(location.id)
    setErrorMessage('')

    try {
      await deleteWarehouseLocation(location.id)
      setDeletedIds((current) => Array.from(new Set([...current, location.id])))
      setSelectedLocation((current) => (current?.id === location.id ? null : current))
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
          description="Zonas, pasillos, estantes y niveles conectados a stock fisico, retiros y capacidad."
          title="Ubicaciones de bodega"
        />
        <InventoryModuleNav />
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo eliminar la bodega" /> : null}
        <div className="two-column-grid">
          <Card>
            <div className="stack">
              <SectionHeader
                description="Codigo de retiro, ruta fisica y uso de capacidad por ubicacion."
                title="Mapa de ubicaciones"
              />
              <LocationTable
                deletingId={deletingId}
                locations={warehouseLocations}
                onDelete={handleDelete}
                onEdit={setSelectedLocation}
              />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <SectionHeader
                description={
                  selectedLocation
                    ? 'Actualiza ruta fisica, capacidad, estado y auditoria de modificacion.'
                    : 'Crea una bodega operativa con ruta fisica y capacidad trazable.'
                }
                title={selectedLocation ? `Editar ${selectedLocation.code}` : 'Crear bodega'}
              />
              <LocationForm location={selectedLocation} onCancel={() => setSelectedLocation(null)} onSaved={handleSaved} />
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
