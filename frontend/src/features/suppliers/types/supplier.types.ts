export type SupplierStatus = 'active' | 'inactive'

export interface Supplier {
  id: string
  name: string
  rut: string
  contactName: string
  phone: string
  email: string
  categories: string[]
  averageDeliveryDays: number
  rating: number
  activePurchaseOrderIds: string[]
  status: SupplierStatus
  notes?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}
