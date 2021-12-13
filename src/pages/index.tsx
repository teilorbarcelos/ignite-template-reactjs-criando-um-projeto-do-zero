import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Prismic from '@prismicio/client'

import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { getPrismicClient } from '../services/prismic'

import commonStyles from '../styles/common.module.scss'
import styles from './home.module.scss'
import { FiCalendar, FiUser } from 'react-icons/fi'
import Header from '../components/Header'
import { RichText } from 'prismic-dom'

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
  console.log(postsPagination)
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
            postsPagination.results.map(post => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <h1>{post.data.title}</h1>
                  <h2>{post.data.subtitle}</h2>
                  <footer>
                    <time><FiCalendar /> {
                      format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR
                        }
                      )
                    }</time>
                    <p><FiUser /> {post.data.author}</p>
                  </footer>
                </a>
              </Link>
            ))
          }

        </div>

        {
          postsPagination.next_page &&
          <Link href={postsPagination.next_page}>
            <a className={styles.morePostsLink}>Carregar mais posts</a>
          </Link>
        }

      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: [],
    pageSize: 2
  })

  const postsPagination = postsResponse

  return {
    props: { postsPagination }
  }
}