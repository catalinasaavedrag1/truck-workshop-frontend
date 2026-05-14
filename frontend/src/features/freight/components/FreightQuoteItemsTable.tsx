import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { FreightQuote, FreightQuoteLineItem } from '../types/freight.types'

interface FreightQuoteItemsTableProps {
  quote: FreightQuote
}

export function FreightQuoteItemsTable({ quote }: FreightQuoteItemsTableProps) {
  const items = buildQuoteItems(quote)

  const columns: TableColumn<FreightQuoteLineItem>[] = [
    { header: 'Concepto', key: 'label', render: (item) => <strong>{item.label}</strong> },
    { align: 'right', header: 'Cantidad', key: 'quantity', render: (item) => item.quantity },
    { align: 'right', header: 'Unitario', key: 'unitAmount', render: (item) => formatCurrency(item.unitAmount) },
    { align: 'right', header: 'Total', key: 'total', render: (item) => formatCurrency(item.total) },
  ]

  return <Table columns={columns} data={items} getRowKey={(item) => item.id} />
}

function buildQuoteItems(quote: FreightQuote): FreightQuoteLineItem[] {
  if (quote.fuelCost !== undefined || quote.tollCost !== undefined || quote.marginAmount !== undefined) {
    const items: FreightQuoteLineItem[] = [
      { id: 'base-rate', label: 'Tarifa base', quantity: 1, total: quote.baseRate, unitAmount: quote.baseRate },
    ]

    if (quote.fuelCost !== undefined) {
      items.push({
        id: 'fuel',
        label: 'Petroleo estimado',
        quantity: quote.fuelLiters || 0,
        total: quote.fuelCost,
        unitAmount: quote.dieselPricePerLiter || 0,
      })
    }

    if (quote.operationCost !== undefined) {
      items.push({
        id: 'operation-km',
        label: 'Costo operacional por km',
        quantity: quote.estimatedKm,
        total: quote.operationCost,
        unitAmount: quote.operationCostPerKm || 0,
      })
    }

    if (quote.tollCost !== undefined) {
      items.push({ id: 'tolls', label: 'Peajes ruta', quantity: 1, total: quote.tollCost, unitAmount: quote.tollCost })
    }

    if (quote.cargoTypeSurcharge > 0) {
      items.push({
        id: 'cargo-surcharge',
        label: 'Recargo tipo de carga',
        quantity: 1,
        total: quote.cargoTypeSurcharge,
        unitAmount: quote.cargoTypeSurcharge,
      })
    }

    if (quote.waitingCost > 0) {
      items.push({ id: 'waiting', label: 'Horas de espera', quantity: 1, total: quote.waitingCost, unitAmount: quote.waitingCost })
    }

    if (quote.loadingCost > 0) {
      items.push({ id: 'loading', label: 'Ayuda de carga', quantity: 1, total: quote.loadingCost, unitAmount: quote.loadingCost })
    }

    if (quote.unloadingCost > 0) {
      items.push({ id: 'unloading', label: 'Ayuda de descarga', quantity: 1, total: quote.unloadingCost, unitAmount: quote.unloadingCost })
    }

    if (quote.marginAmount !== undefined) {
      items.push({ id: 'margin', label: 'Margen operacional', quantity: 1, total: quote.marginAmount, unitAmount: quote.marginAmount })
    }

    return items
  }

  return [
    { id: 'base-rate', label: 'Tarifa base', quantity: 1, total: quote.baseRate, unitAmount: quote.baseRate },
    {
      id: 'distance',
      label: 'Kilometraje',
      quantity: quote.estimatedKm,
      total: quote.estimatedKm * quote.kmRate,
      unitAmount: quote.kmRate,
    },
    {
      id: 'cargo-surcharge',
      label: 'Recargo tipo de carga',
      quantity: 1,
      total: quote.cargoTypeSurcharge,
      unitAmount: quote.cargoTypeSurcharge,
    },
    { id: 'waiting', label: 'Horas de espera', quantity: 1, total: quote.waitingCost, unitAmount: quote.waitingCost },
    { id: 'loading', label: 'Ayuda de carga', quantity: 1, total: quote.loadingCost, unitAmount: quote.loadingCost },
    { id: 'unloading', label: 'Ayuda de descarga', quantity: 1, total: quote.unloadingCost, unitAmount: quote.unloadingCost },
  ].filter((item) => item.total > 0 || item.id === 'base-rate')
}
