export interface Part {
  id: string
  sku: string
  name: string
  category: string
  stock: number
  minStock: number
  unitCost: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
}
