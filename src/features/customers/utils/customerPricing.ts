import { CARGO_TYPE_LABELS } from '../../freight/constants/cargoType.constants'
import { FREIGHT_PRICING } from '../../freight/constants/freightPricing.constants'
import type { CargoType } from '../../freight/types/freight.types'
import type { Customer, CustomerPriceListItem } from '../types/customer.types'

export function getDefaultPriceListItem(cargoType: CargoType): CustomerPriceListItem {
  return {
    baseRate: FREIGHT_PRICING.baseRate,
    cargoType,
    discountPercent: 0,
    id: `price-${cargoType.toLowerCase()}`,
    kmRate: FREIGHT_PRICING.kmRate,
    label: CARGO_TYPE_LABELS[cargoType],
    minimumCharge: 0,
    notes: '',
  }
}

export function getCustomerPriceForCargo(customer: Customer | undefined, cargoType: CargoType) {
  return customer?.priceList.find((item) => item.cargoType === cargoType)
}

export function getCreditUsagePercent(customer: Customer) {
  if (!customer.creditEnabled || customer.creditLimit <= 0) {
    return 0
  }

  return Math.min(100, Math.round((customer.creditUsed / customer.creditLimit) * 100))
}

export function getCustomerCommercialSignal(customer: Customer) {
  if (customer.status === 'suspended') {
    return 'Credito o condiciones suspendidas'
  }

  if (customer.creditEnabled && getCreditUsagePercent(customer) >= 90) {
    return 'Credito casi agotado'
  }

  if (customer.priceList.length > 0) {
    return `${customer.priceList.length} tarifas diferenciales`
  }

  return 'Tarifa general'
}
