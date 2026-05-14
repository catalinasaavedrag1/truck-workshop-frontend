import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { partsMock } from '../../../mocks/parts.mock'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { InventoryModuleNav } from '../../warehouse/components/InventoryModuleNav'
import styles from '../../warehouse/components/InventoryModule.module.css'
import { getPartInventoryRows } from '../../warehouse/services/warehouseInsights.service'
import type { StockStatus } from '../../warehouse/types/warehouse.types'
import { PartForm } from '../components/PartForm'
import { PartInventorySummary } from '../components/PartInventorySummary'
import { PartsRequiredByCase } from '../components/PartsRequiredByCase'
import { PartsTable } from '../components/PartsTable'
import { deletePart } from '../services/parts.service'
import type { Part } from '../types/part.types'

export function PartsPage() {
  const [savedParts, setSavedParts] = useState<Part[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { data: partsData } = useResourceList<Part>('/parts', partsMock, { order: 'asc', sort: 'sku' })
  const parts = useMemo(() => {
    const savedById = new Map(savedParts.map((part) => [part.id, part]))

    return [
      ...partsData.filter((part) => !deletedIds.includes(part.id) && !savedById.has(part.id)),
      ...savedParts.filter((part) => !deletedIds.includes(part.id)),
    ].sort((first, second) => first.sku.localeCompare(second.sku))
  }, [deletedIds, partsData, savedParts])
  const rows = useMemo(() => getPartInventoryRows(parts), [parts])
  const categories = Array.from(new Set(rows.map((row) => row.category)))
  const statusOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Disponible', value: 'available' },
    { label: 'Bajo stock', value: 'low-stock' },
    { label: 'Sin stock', value: 'out-of-stock' },
  ]
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState<StockStatus | 'all'>('all')

  const filteredRows = rows.filter((row) => {
    const matchesQuery = [row.sku, row.name, row.category, row.locationCode, row.pendingPurchaseOrder || '']
      .join(' ')
      .toLowerCase()
      .includes(query.trim().toLowerCase())
    const matchesCategory = category === 'all' || row.category === category
    const matchesStatus = status === 'all' || row.status === status

    return matchesQuery && matchesCategory && matchesStatus
  })
  const statusLabel = statusOptions.find((option) => option.value === status)?.label

  const handleSaved = (part: Part) => {
    setSavedParts((current) => [
      part,
      ...current.filter((item) => item.id !== part.id),
    ])
    setDeletedIds((current) => current.filter((id) => id !== part.id))
    setSelectedPart(null)
    setIsEditorOpen(false)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleCreate = () => {
    setSelectedPart(null)
    setIsEditorOpen(true)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleEdit = (row: { partId: string }) => {
    const part = parts.find((item) => item.id === row.partId)

    if (part) {
      setSelectedPart(part)
      setIsEditorOpen(true)
      setErrorMessage('')
      setSuccessMessage('')
    }
  }

  const handleDelete = async (row: { partId: string; sku: string }) => {
    if (!window.confirm(`Eliminar SKU ${row.sku}?`)) {
      return
    }

    setDeletingId(row.partId)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const removedPart = await deletePart(row.partId)
      setDeletedIds((current) => Array.from(new Set([...current, row.partId])))
      setSelectedPart((current) => (current?.id === row.partId ? null : current))
      setIsEditorOpen((current) => (selectedPart?.id === row.partId ? false : current))
      setSuccessMessage(`SKU ${removedPart.sku} eliminado por ${removedPart.deletedBy || removedPart.updatedBy || 'Sistema'}`)
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
            <div className="inline-actions">
              <Button icon={<Plus size={16} />} onClick={handleCreate} size="sm" type="button">
                Nuevo SKU
              </Button>
              <Link to={ROUTES.warehouseStock}>
                <Button size="sm" variant="secondary">
                  Ver stock
                </Button>
              </Link>
              <Link to={ROUTES.inventoryReport}>
                <Button size="sm" variant="secondary">
                  Reporte
                </Button>
              </Link>
            </div>
          }
          description="Catalogo maestro conectado a stock fisico, demanda de taller, reposicion sugerida y OC activa."
          title="Repuestos / SKUs"
        />
        <InventoryModuleNav />
        <PartInventorySummary rows={rows} />
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo eliminar el SKU" /> : null}
        {successMessage ? (
          <Card>
            <p className="muted-text" role="status">
              {successMessage}
            </p>
          </Card>
        ) : null}
        <FilterBar
          activeCount={(query ? 1 : 0) + (category !== 'all' ? 1 : 0) + (status !== 'all' ? 1 : 0)}
          activeFilters={[
            ...(query ? [{ label: 'Busqueda', onRemove: () => setQuery(''), value: query }] : []),
            ...(category !== 'all' ? [{ label: 'Categoria', onRemove: () => setCategory('all'), value: category }] : []),
            ...(status !== 'all' ? [{ label: 'Estado', onRemove: () => setStatus('all'), value: statusLabel }] : []),
          ]}
          description="Busca el repuesto por SKU, nombre, categoria, ubicacion u orden de compra."
          onClear={() => {
            setQuery('')
            setCategory('all')
            setStatus('all')
          }}
          title="Buscar repuestos"
        >
          <Input
            label="Busqueda"
            name="partSearch"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtro, BRK-2210, neumatico..."
            value={query}
          />
          <Select
            label="Categoria"
            name="partCategory"
            onChange={(event) => setCategory(event.target.value)}
            options={[{ label: 'Todas', value: 'all' }, ...categories.map((item) => ({ label: item, value: item }))]}
            value={category}
          />
          <Select
            label="Estado"
            name="partStatus"
            onChange={(event) => setStatus(event.target.value as StockStatus | 'all')}
            options={statusOptions}
            value={status}
          />
        </FilterBar>
        <div className={isEditorOpen ? styles.inventoryEditorLayout : undefined}>
          <Card className={styles.primaryQueue}>
            <div className="stack">
              <SectionHeader
                description="La tabla responde que SKU es, donde esta, cuanto queda, si hay demanda y si debe comprarse."
                title="Catalogo operativo"
              />
              <PartsTable deletingId={deletingId} onDelete={handleDelete} onEdit={handleEdit} parts={filteredRows} />
            </div>
          </Card>
          {isEditorOpen ? (
            <Card className={styles.editorPanel}>
              <div className="stack">
                <SectionHeader
                  description={
                    selectedPart
                      ? 'Actualiza datos maestros, stock, costos y auditoria de modificacion.'
                      : 'Crea un SKU maestro para bodega, compras y taller.'
                  }
                  title={selectedPart ? `Editar ${selectedPart.sku}` : 'Crear SKU'}
                />
                <PartForm
                  onCancel={() => {
                    setSelectedPart(null)
                    setIsEditorOpen(false)
                  }}
                  onSaved={handleSaved}
                  part={selectedPart}
                />
              </div>
            </Card>
          ) : null}
        </div>
        <PartsRequiredByCase />
      </div>
    </PageContainer>
  )
}
