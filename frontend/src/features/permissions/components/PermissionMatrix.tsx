import { Fragment } from 'react'
import type { PermissionModule, Role } from '../types/permission.types'
import styles from './PermissionsModule.module.css'

interface PermissionMatrixProps {
  modules: PermissionModule[]
  roles: Role[]
}

export function PermissionMatrix({ modules, roles }: PermissionMatrixProps) {
  return (
    <div className={styles.matrixWrap}>
      <table className={styles.matrix}>
        <thead>
          <tr>
            <th>Permiso</th>
            {roles.map((role) => (
              <th key={role.code}>{role.code}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {modules.map((module) => (
            <Fragment key={module.id}>
              <tr className={styles.moduleDivider} key={`${module.id}-divider`}>
                <td colSpan={roles.length + 1}>{module.label}</td>
              </tr>
              {module.permissions.map((permission) => (
                <tr key={permission.key}>
                  <td>
                    <strong>{permission.label}</strong>
                    <p className={styles.muted}>{permission.key}</p>
                  </td>
                  {roles.map((role) => (
                    <td key={`${role.code}-${permission.key}`}>
                      <input
                        aria-label={`${role.code} ${permission.label}`}
                        checked={role.permissions.includes(permission.key)}
                        readOnly
                        type="checkbox"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
