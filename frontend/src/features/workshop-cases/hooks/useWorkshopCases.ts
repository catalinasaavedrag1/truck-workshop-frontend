import { useEffect, useMemo, useState } from 'react'
import { getWorkshopCases } from '../services/workshopCases.service'
import type { WorkshopCase, WorkshopCaseFilters } from '../types/workshopCase.types'

const initialFilters: WorkshopCaseFilters = {
  priority: 'all',
  query: '',
  slaStatus: 'all',
  status: 'all',
}

export function useWorkshopCases() {
  const [sourceCases, setSourceCases] = useState<WorkshopCase[]>([])
  const [filters, setFilters] = useState(initialFilters)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getWorkshopCases()
      .then((items) => {
        if (isMounted) {
          setSourceCases(items)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const cases = useMemo(() => {
    const query = filters.query.trim().toLowerCase()

    return sourceCases.filter((item) => {
      const matchesQuery =
        !query ||
        item.caseNumber.toLowerCase().includes(query) ||
        item.truckPlate.toLowerCase().includes(query) ||
        item.customerName.toLowerCase().includes(query) ||
        item.driverName.toLowerCase().includes(query)
      const matchesStatus = filters.status === 'all' || item.status === filters.status
      const matchesPriority = filters.priority === 'all' || item.priority === filters.priority
      const matchesSla = filters.slaStatus === 'all' || item.slaStatus === filters.slaStatus

      return matchesQuery && matchesStatus && matchesPriority && matchesSla
    })
  }, [filters, sourceCases])

  return { cases, filters, isLoading, setFilters }
}
