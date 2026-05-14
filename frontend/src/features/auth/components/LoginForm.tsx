import type { FormEvent } from 'react'
import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { login } from '../services/auth.service'

export function LoginForm() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    const formData = new FormData(event.currentTarget)
    try {
      const session = await login({
        email: String(formData.get('email') || ''),
        password: String(formData.get('password') || ''),
      })

      localStorage.setItem('truck-workshop-session', JSON.stringify(session))
      navigate(ROUTES.dashboard)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
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
