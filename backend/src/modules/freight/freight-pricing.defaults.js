export const DEFAULT_CARGO_SURCHARGES = {
  BULK: 15_000,
  FRAGILE: 25_000,
  GENERAL: 0,
  HAZARDOUS: 60_000,
  OVERSIZED: 50_000,
  PALLETIZED: 10_000,
  REFRIGERATED: 40_000,
}

export const DEFAULT_FREIGHT_PRICING_SETTINGS = {
  active: true,
  baseRate: 35_000,
  cargoSurcharges: DEFAULT_CARGO_SURCHARGES,
  currencyCode: 'CLP',
  dieselPricePerLiter: 1_050,
  fuelKmPerLiter: 3.2,
  id: 'default-freight-pricing',
  loadingHelpCost: 25_000,
  marginPercent: 18,
  name: 'Tarifa operativa primera milla',
  operationCostPerKm: 420,
  taxPercent: 19,
  tollMarkupPercent: 0,
  unloadingHelpCost: 25_000,
  waitingHourRate: 15_000,
}
