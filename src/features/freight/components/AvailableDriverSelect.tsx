import { driversMock } from '../../drivers/mocks/drivers.mock'
import { Select } from '../../../shared/components/Select/Select'

export function AvailableDriverSelect() {
  const activeDrivers = driversMock.filter((driver) => driver.status === 'active')
  const options = activeDrivers.map((driver) => ({
    label: `${driver.name} - ${driver.company}`,
    value: driver.id,
  }))

  return <Select label="Chofer disponible" name="driverId" options={options} />
}
