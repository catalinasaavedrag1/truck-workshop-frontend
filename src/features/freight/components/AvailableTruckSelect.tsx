import { Select } from '../../../shared/components/Select/Select'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'

export function AvailableTruckSelect() {
  const availableTrucks = fleetTrucksMock.filter((truck) => truck.operationalStatus === 'AVAILABLE')
  const options =
    availableTrucks.length > 0
      ? availableTrucks.map((truck) => ({
          label: `${truck.plate} - ${truck.brand} ${truck.model}`,
          value: truck.id,
        }))
      : [{ label: 'Sin camiones disponibles', value: '' }]

  return <Select label="Camion disponible" name="truckId" options={options} />
}
