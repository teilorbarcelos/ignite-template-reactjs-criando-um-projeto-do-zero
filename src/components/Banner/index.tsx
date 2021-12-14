import styles from './styles.module.scss'

interface Props {
  imgAddress: string
}

export default function Banner({ imgAddress }: Props) {
  return (
    <div className={styles.banner} id="banner">
      <img src={imgAddress} alt="Image Post Illustration" />
    </div>
  )
}