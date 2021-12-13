import styles from './header.module.scss'

export default function Header() {
  // TODO
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <img src="/Logo.svg" alt="logo" />
      </div>
    </header>
  )
}
