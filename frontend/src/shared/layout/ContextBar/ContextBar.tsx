import { createElement } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { findNavigationContext, getRelatedNavigationItems } from '../../navigation/navigationContext'
import { getSidebarIcon } from '../Sidebar/sidebarIcons'
import styles from './ContextBar.module.css'

export function ContextBar() {
  const location = useLocation()
  const match = findNavigationContext(`${location.pathname}${location.search}`)

  if (!match) {
    return null
  }

  const isChild = match.item.path !== match.parent.path
  const showGroup = match.group.label !== 'Plataforma'
  const relatedItems = getRelatedNavigationItems(match)
  const sectionLabel = match.item.section

  return (
    <section className={styles.contextBar} aria-label="Contexto operacional">
      <div className={styles.identity}>
        <span className={styles.moduleIcon}>
          {createElement(getSidebarIcon(match.parent.icon), { 'aria-hidden': true, size: 15 })}
        </span>
        {showGroup ? (
          <>
            <span className={styles.group}>{match.group.label}</span>
            <span className={styles.separator}>/</span>
          </>
        ) : null}
        <Link className={styles.parentLink} to={match.parent.path}>
          {match.parent.label}
        </Link>
        {isChild ? (
          <>
            <span className={styles.separator}>/</span>
            <span className={styles.current}>{match.item.label}</span>
          </>
        ) : null}
        {sectionLabel ? <span className={styles.sectionPill}>{sectionLabel}</span> : null}
      </div>
      {relatedItems.length > 0 ? (
        <nav aria-label={`Vistas relacionadas de ${match.parent.label}`} className={styles.relatedNav}>
          {relatedItems.map((item) => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </section>
  )
}
