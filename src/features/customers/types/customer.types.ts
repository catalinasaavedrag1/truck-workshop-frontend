import type { CargoType } from '../../freight/types/freight.types'

export type CustomerStatus = 'active' | 'inactive' | 'suspended'
export type CustomerRiskLevel = 'low' | 'medium' | 'high'

export interface CustomerPriceListItem {
  id: string
  cargoType: CargoType
  label: string
  baseRate: number
  kmRate: number
  minimumCharge: number
  discountPercent: number
  notes?: string
}

export interface Customer {
  id: string
  name: string
  rut?: string
  contactName?: string
  phone?: string
  email?: string
  billingAddress?: string
  preferredOrigins: string[]
  preferredDestinations: string[]
  freightTypes: CargoType[]
  priceList: CustomerPriceListItem[]
  creditEnabled: boolean
  creditLimit: number
  creditUsed: number
  paymentTermsDays: number
  status: CustomerStatus
  riskLevel: CustomerRiskLevel
  notes?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
}

export type CustomerPayload = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedBy'>
