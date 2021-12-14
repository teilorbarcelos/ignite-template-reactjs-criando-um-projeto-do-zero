import Link from 'next/link'
import styles from './header.module.scss'

interface Props {
  page?: string
}

export default function Header({ page }: Props) {
  // TODO
  return (
    <header className={`${styles.container} ${page === 'post' ? styles.post : ''}`}>
      <Link href="/">
        <a>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
