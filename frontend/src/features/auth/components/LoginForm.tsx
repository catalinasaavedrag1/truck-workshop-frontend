import type { FormEvent } from 'react'
import { useCallback } from 'react'
import { LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction'
import { login } from '../services/auth.service'

export function LoginForm() {
  const navigate = useNavigate()
  const submitLogin = useCallback(
    async (credentials: { email: string; password: string }) => {
      const session = await login(credentials)

      localStorage.setItem('truck-workshop-session', JSON.stringify(session))
      navigate(ROUTES.dashboard)
    },
    [navigate],
  )
  const { errorMessage, isRunning: isSubmitting, run } = useAsyncAction(submitLogin)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    try {
      await run({
        email: String(formData.get('email') || ''),
        password: String(formData.get('password') || ''),
      })
    } catch {
      // useAsyncAction centralizes user-facing error mapping.
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      {errorMessage ? (
        <ErrorState title="No se pudo iniciar sesion" description={errorMessage} />
      ) : null}
      <Input
        autoComplete="email"
        label="Email"
        name="email"
        type="email"
      />
      <Input
        autoComplete="current-password"
        label="Contrasena"
        name="password"
        type="password"
      />
      <Button disabled={isSubmitting} fullWidth icon={<LogIn size={18} />} type="submit">
        {isSubmitting ? 'Entrando...' : 'Entrar al taller'}
      </Button>
    </form>
  )
}
