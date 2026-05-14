import { useEffect, useState } from 'react'
import { getWorkshopCaseById } from '../services/workshopCases.service'
import type { WorkshopCase } from '../types/workshopCase.types'

export function useWorkshopCaseDetail(caseId: string | undefined) {
  const [workshopCase, setWorkshopCase] = useState<WorkshopCase | undefined>()
  const [isLoading, setIsLoading] = useState(Boolean(caseId))

  useEffect(() => {
    if (!caseId) {
      return undefined
    }

    let isMounted = true

    getWorkshopCaseById(caseId)
      .then((item) => {
        if (isMounted) {
          setWorkshopCase(item)
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
  }, [caseId])

  return {
    isLoading,
    isMissing: !isLoading && !workshopCase,
    workshopCase,
  }
}
