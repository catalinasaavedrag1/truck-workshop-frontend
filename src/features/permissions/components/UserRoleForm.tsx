import type { FormEvent } from 'react'
import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { permissionsApi } from '../services/permissions.service'
import type { Role, UserRoleAssignment } from '../types/permission.types'
import styles from './PermissionsModule.module.css'

interface UserRoleFormProps {
  onCancel?: () => void
  onSaved: () => void
  roles: Role[]
  user?: UserRoleAssignment | null
}

export function UserRoleForm({ onCancel, onSaved, roles, user }: UserRoleFormProps) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      email: String(formData.get('email') || '').trim(),
      roleCode: String(formData.get('roleCode') || '').trim(),
      userId: String(formData.get('userId') || '').trim(),
      userName: String(formData.get('userName') || '').trim(),
    }

    setErrorMessage('')
    setSavedMessage('')
    setIsSaving(true)

    try {
      if (user) {
        await permissionsApi.updateUser(user.id, payload)
      } else {
        await permissionsApi.createUser(payload)
        form.reset()
      }

      setSavedMessage(user ? 'Usuario actualizado.' : 'Usuario creado.')
      onSaved()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className={styles.form} key={user?.id || 'new-user'} onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className={styles.span2}>
          <ErrorState description={errorMessage} title="No se pudo guardar el usuario" />
        </div>
      ) : null}
      <Input defaultValue={user?.userName || ''} label="Nombre usuario" name="userName" placeholder="Nombre Apellido" required />
      <Input defaultValue={user?.email || ''} label="Correo" name="email" placeholder="usuario@empresa.cl" required type="email" />
      <Input defaultValue={user?.userId || ''} helperText="Puede quedar vacio al crear: se genera desde el nombre." label="ID interno" name="userId" placeholder="user-009" />
      <Select
        defaultValue={user?.roleCode || roles[0]?.code || ''}
        label="Perfil"
        name="roleCode"
        options={roles.map((role) => ({ label: `${role.name} (${role.code})`, value: role.code }))}
      />
      <div className={[styles.formActions, styles.span2].join(' ')}>
        <Button disabled={isSaving || roles.length === 0} icon={<Save size={18} />} type="submit">
          {isSaving ? 'Guardando...' : user ? 'Actualizar usuario' : 'Crear usuario'}
        </Button>
        {user ? (
          <Button disabled={isSaving} icon={<X size={18} />} onClick={onCancel} type="button" variant="secondary">
            Cancelar edicion
          </Button>
        ) : null}
        {savedMessage ? <span className={styles.muted}>{savedMessage}</span> : null}
      </div>
    </form>
  )
}
