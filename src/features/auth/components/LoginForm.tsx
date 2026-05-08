import type { FormEvent } from 'react'
import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Input } from '../../../shared/components/Input/Input'
import { login } from '../services/auth.service'

export function LoginForm() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const session = await login({
      email: String(formData.get('email') || ''),
      password: String(formData.get('password') || ''),
    })

    localStorage.setItem('truck-workshop-session', JSON.stringify(session))
    setIsSubmitting(false)
    navigate(ROUTES.dashboard)
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <Input
        autoComplete="email"
        defaultValue="admin@truckworkshop.cl"
        label="Email"
        name="email"
        type="email"
      />
      <Input
        autoComplete="current-password"
        defaultValue="truckworkshop"
        label="Password"
        name="password"
        type="password"
      />
      <Button disabled={isSubmitting} fullWidth icon={<LogIn size={18} />} type="submit">
        {isSubmitting ? 'Entrando...' : 'Entrar al taller'}
      </Button>
    </form>
  )
}
