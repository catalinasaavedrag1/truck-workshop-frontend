import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { CARGO_TYPE_LABELS } from '../../freight/constants/cargoType.constants'
import type { CustomerPriceListItem } from '../types/customer.types'

interface CustomerPriceListTableProps {
  priceList: CustomerPriceListItem[]
}

export function CustomerPriceListTable({ priceList }: CustomerPriceListTableProps) {
  const columns: TableColumn<CustomerPriceListItem>[] = [
    {
      header: 'Tipo de flete',
      key: 'cargoType',
      render: (item) => (
        <div>
          <strong>{CARGO_TYPE_LABELS[item.cargoType]}</strong>
          <p className="muted-text">{item.label}</p>
        </div>
      ),
    },
    { align: 'right', header: 'Base', key: 'baseRate', render: (item) => formatCurrency(item.baseRate) },
    { align: 'right', header: 'KM', key: 'kmRate', render: (item) => `${formatCurrency(item.kmRate)} / km` },
    { align: 'right', header: 'Minimo', key: 'minimumCharge', render: (item) => formatCurrency(item.minimumCharge) },
    { align: 'right', header: 'Descuento', key: 'discountPercent', render: (item) => `${item.discountPercent}%` },
  ]

  return (
    <Table
      columns={columns}
      data={priceList}
      density="compact"
      emptyDescription="Agrega tipos de flete al cliente para crear tarifas diferenciales."
      emptyLabel="Sin lista de precios"
      getRowKey={(item) => item.id}
    />
  )
}
