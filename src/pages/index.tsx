import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic'

import commonStyles from '../styles/common.module.scss'
import styles from './home.module.scss'
import { FiCalendar, FiUser } from 'react-icons/fi'
import Header from '../components/Header'

interface Post {
  uid?: string
  first_publication_date: string | null
  data: {
    title: string
    subtitle: string
    author: string
  }
}

interface PostPagination {
  next_page: string
  results: Post[]
}

interface HomeProps {
  postsPagination: PostPagination
}

export default function Home({ postsPagination }: HomeProps) {
  // TODO
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <Header />
      <main className={styles.container}>

        <div className={styles.posts}>

          {
            postsPagination?.results.map(post => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <h1>{post.data.title}</h1>
                  <h2>{post.data.subtitle}</h2>
                  <time><FiCalendar /> {post.first_publication_date}</time>
                  <p><FiUser /> {post.data.author}</p>
                </a>
              </Link>
            ))
          }

        </div>
      </main>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient()
//   // const postsResponse = await prismic.query(TODO)

//   // TODO
// }
