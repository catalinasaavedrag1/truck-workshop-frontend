import type { FormEvent } from 'react'
import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { permissionModulesMock } from '../mocks/permissions.mock'
import { permissionsApi } from '../services/permissions.service'
import type { PermissionKey, PermissionModule, Role } from '../types/permission.types'
import styles from './PermissionsModule.module.css'

interface RoleFormProps {
  modules?: PermissionModule[]
  onCancel?: () => void
  onSaved: () => void
  role?: Role | null
}

export function RoleForm({ modules = permissionModulesMock, onCancel, onSaved, role }: RoleFormProps) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const permissions = formData.getAll('permissions').map(String) as PermissionKey[]
    const payload = {
      code: String(formData.get('code') || '').trim().toUpperCase(),
      description: String(formData.get('description') || '').trim(),
      name: String(formData.get('roleName') || '').trim(),
      permissions,
    }

    setErrorMessage('')
    setSavedMessage('')
    setIsSaving(true)

    try {
      if (role) {
        await permissionsApi.updateRole(role.id, payload)
      } else {
        await permissionsApi.createRole(payload)
        form.reset()
      }

      setSavedMessage(role ? 'Perfil actualizado.' : 'Perfil creado.')
      onSaved()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className={styles.form} key={role?.id || 'new-role'} onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className={styles.span2}>
          <ErrorState description={errorMessage} title="No se pudo guardar el perfil" />
        </div>
      ) : null}
      <Input defaultValue={role?.name || ''} label="Nombre perfil" name="roleName" placeholder="Supervisor de turno" required />
      <Input defaultValue={role?.code || ''} label="Codigo" name="code" placeholder="SUPERVISOR_TURNO" required />
      <Input className={styles.span2} defaultValue={role?.description || ''} label="Alcance operacional" name="description" placeholder="Que puede hacer este perfil dentro de la operacion" />
      <div className={styles.span2}>
        <div className={styles.permissionPicker}>
          {modules.map((module) => (
            <div className={styles.permissionGroup} key={module.id}>
              <strong>{module.label}</strong>
              {module.permissions.map((permission) => (
                <label className={styles.checkRow} key={permission.key}>
                  <input defaultChecked={role?.permissions.includes(permission.key)} name="permissions" type="checkbox" value={permission.key} />
                  <span>{permission.label}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={[styles.formActions, styles.span2].join(' ')}>
        <Button disabled={isSaving} icon={<Save size={18} />} type="submit">
          {isSaving ? 'Guardando...' : role ? 'Actualizar perfil' : 'Crear perfil'}
        </Button>
        {role ? (
          <Button disabled={isSaving} icon={<X size={18} />} onClick={onCancel} type="button" variant="secondary">
            Cancelar edicion
          </Button>
        ) : null}
        {savedMessage ? <span className={styles.muted}>{savedMessage}</span> : null}
      </div>
    </form>
  )
}
