import { Card } from '../../../shared/components/Card/Card'
import { LoginForm } from '../components/LoginForm'
import styles from './LoginPage.module.css'

export function LoginPage() {
  return (
    <main className={styles.page}>
      <Card className="stack">
        <div className="stack">
          <img alt="" className={styles.logo} src="/logo.svg" />
          <div>
            <h1 className="section-title">Truck Workshop</h1>
            <p className="muted-text">Gestion operativa del taller</p>
          </div>
        </div>
        <LoginForm />
      </Card>
    </main>
  )
}
