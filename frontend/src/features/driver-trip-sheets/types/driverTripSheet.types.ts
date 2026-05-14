export type DriverTripSheetStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'PAID'

export type DriverTripExpenseCategory =
  | 'FUEL'
  | 'TOLL'
  | 'MEAL'
  | 'TIP'
  | 'PARKING'
  | 'LODGING'
  | 'WAITING'
  | 'OTHER'

export interface DriverTripExpenseItem {
  id: string
  category: DriverTripExpenseCategory
  label: string
  amount: number
  paidBy?: string
  receiptUrl?: string
  notes?: string
}

export interface DriverTripSheet {
  id: string
  sheetNumber: string
  freightId?: string
  requestId?: string
  quoteId?: string
  assignmentId?: string
  driverId: string
  driverName: string
  truckId: string
  truckPlate: string
  customerId?: string
  customerName?: string
  originAddress?: string
  destinationAddress?: string
  tripDate: string
  deliveredAt?: string
  kmPlanned: number
  kmReal: number
  revenue: number
  fuelCost: number
  tollCost: number
  mealCost: number
  tipCost: number
  parkingCost: number
  lodgingCost: number
  otherCost: number
  waitingHours: number
  waitingCost: number
  totalExpenses: number
  grossMargin: number
  netMargin: number
  costPerKm: number
  revenuePerKm: number
  performanceScore: number
  status: DriverTripSheetStatus
  expenseItems: DriverTripExpenseItem[]
  notes?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
  createdAt?: string
  updatedAt?: string
}

export type DriverTripSheetPayload = Omit<DriverTripSheet, 'id' | 'createdAt' | 'updatedAt' | 'deletedBy'>
