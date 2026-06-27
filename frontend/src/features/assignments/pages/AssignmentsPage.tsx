import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { casesMock } from '../../../mocks/cases.mock'
import { mechanicsMock } from '../../../mocks/mechanics.mock'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { useModal } from '../../../shared/hooks/useModal'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { toast } from '../../../shared/services/toastStore'
import { AssignmentBoard } from '../components/AssignmentBoard'
import { AssignCaseModal } from '../components/AssignCaseModal'
import { assignCase } from '../services/assignments.service'
import type { Assignment } from '../types/assignment.types'
import type { Mechanic } from '../../mechanics/types/mechanic.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'

export function AssignmentsPage() {
  const modal = useModal()
  const { data: workshopCases } = useResourceList<WorkshopCase>('/cases', casesMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: mechanics } = useResourceList<Mechanic>('/mechanics', mechanicsMock, { order: 'asc', sort: 'name' })
  const { data: loadedAssignments } = useResourceList<Assignment>('/assignments', [], {
    order: 'desc',
    sort: 'assignedAt',
  })
  const [localAssignments, setLocalAssignments] = useState<Assignment[]>([])
  const [assignmentError, setAssignmentError] = useState('')
  const [selectedCaseIdOverride, setSelectedCaseIdOverride] = useState('')
  const [assignmentTarget, setAssignmentTarget] = useState<{ caseId?: string; mechanicId?: string }>({})
  const assignments = [
    ...localAssignments,
    ...loadedAssignments.filter(
      (loadedAssignment) => !localAssignments.some((localAssignment) => localAssignment.caseId === loadedAssignment.caseId),
    ),
  ]
  const selectedCaseId =
    selectedCaseIdOverride || workshopCases.find((workshopCase) => workshopCase.status !== 'closed')?.id || ''

  const handleOpenAssignment = (caseId = selectedCaseId, mechanicId?: string) => {
    setAssignmentTarget({ caseId, mechanicId })
    modal.open()
  }

  const handleAssign = async (assignment: Assignment) => {
    setAssignmentError('')

    try {
      const savedAssignment = await assignCase(assignment)

      setLocalAssignments((currentAssignments) => [
        savedAssignment,
        ...currentAssignments.filter((item) => item.caseId !== savedAssignment.caseId),
      ])
      setSelectedCaseIdOverride(savedAssignment.caseId)
      modal.close()
      toast.success('Caso asignado', 'La asignacion se registro correctamente.')
    } catch (error) {
      setAssignmentError(getApiErrorMessage(error))
    }
  }

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Button icon={<UserPlus size={18} />} onClick={() => handleOpenAssignment()}>
            Asignar caso
          </Button>
        }
        description="Distribuye casos por prioridad, SLA y capacidad del taller."
        title="Asignaciones"
      />
      {assignmentError ? <ErrorState description={assignmentError} title="No se pudo asignar el caso" /> : null}
      <AssignmentBoard
        assignments={assignments}
        mechanics={mechanics}
        onAssignRequest={handleOpenAssignment}
        onSelectCase={setSelectedCaseIdOverride}
        selectedCaseId={selectedCaseId}
        workshopCases={workshopCases}
      />
      <AssignCaseModal
        mechanics={mechanics}
        workshopCases={workshopCases}
        initialCaseId={assignmentTarget.caseId}
        initialMechanicId={assignmentTarget.mechanicId}
        onAssign={handleAssign}
        onClose={modal.close}
        open={modal.isOpen}
      />
    </PageContainer>
  )
}
