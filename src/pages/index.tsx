import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Prismic from '@prismicio/client'

import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { getPrismicClient } from '../services/prismic'

import styles from './home.module.scss'
import { FiCalendar, FiUser } from 'react-icons/fi'
import Header from '../components/Header'
import { useState } from 'react'

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
  const [nextPage, setNextPage] = useState<string | null>(postsPagination.next_page)

  function dateFormat(date: string) {
    const formatedDate = format(
      new Date(date),
      'dd MMM yyyy',
      {
        locale: ptBR
      }
    )

    return formatedDate
  }

  const [posts, setPosts] = useState<Post[]>(
    postsPagination.results.map(post => {
      return {
        ...post,
        first_publication_date: dateFormat(post.first_publication_date)
      }
    })
  )

  async function handleChargeMore() {
    if (!nextPage) {
      return
    }

    const nextPosts = await (await fetch(nextPage)).json() as PostPagination

    setNextPage(nextPosts.next_page)

    const newPosts = nextPosts.results.map(post => {
      return {
        ...post,
        first_publication_date: dateFormat(post.first_publication_date)
      }
    })

    setPosts([
      ...posts,
      ...newPosts
    ])
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <Header />

      <main className={styles.container}>

        <div className={styles.posts}>

          {
            posts.map(post => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <h1>{post.data.title}</h1>
                  <h2>{post.data.subtitle}</h2>
                  <footer>
                    <time><FiCalendar /> {post.first_publication_date}</time>
                    <p><FiUser /> {post.data.author}</p>
                  </footer>
                </a>
              </Link>
            ))
          }

        </div>

        {
          nextPage &&
          <div className={styles.morePostsLink}>
            <a
              onClick={handleChargeMore}
            >Carregar mais posts</a>
          </div>
        }

      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
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