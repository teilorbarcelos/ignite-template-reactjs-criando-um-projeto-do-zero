import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi'
import Banner from '../../components/Banner'
import Header from '../../components/Header'

import { getPrismicClient } from '../../services/prismic'

import styles from './post.module.scss'

interface Post {
  first_publication_date: string | null
  data: {
    title: string
    banner: {
      url: string
    }
    author: string
    content: {
      heading: string
      body: {
        text: string
      }[]
    }[]
  }
}

interface PostProps {
  post: Post
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <p>Carregando...</p>
  }

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

  const totalWords = post.data.content.reduce((sum, contentItem) => {
    sum += contentItem.heading.split(' ').length

    const words = contentItem.body.map(item => item.text.split(' ').length)
    words.map(word => (sum += word))
    return sum
  }, 0)

  const readTime = Math.ceil(totalWords / 200)

  return (
    <>
      <Header page="post" />

      <Banner imgAddress={post.data.banner.url} />

      <main className={styles.container}>
        <h1>{post.data.title}</h1>
        <div className={styles.postInfo}>
          <time><FiCalendar /> {dateFormat(post.first_publication_date)}</time>
          <p><FiUser /> {post.data.author}</p>
          <p className={styles.estimatedTime}><FiClock /> {readTime} min</p>
        </div>

        {
          post.data.content.map(contentItem => (
            <>
              <h2>{contentItem.heading}</h2>
              {
                contentItem.body.map(bodyItem => (
                  <p>{bodyItem.text}</p>
                ))
              }
            </>
          ))
        }
      </main>
    </>
  )
}

export const getStaticPaths = () => {
  return {
    paths: [
      {
        params: {
          slug: "como-utilizar-hooks",
        },
      },
      {
        params: {
          slug: "criando-um-app-cra-do-zero",
        },
      },
    ],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient()
  const { slug } = params
  const response = await prismic.getByUID('posts', String(slug), {})

  // TODO
  const post = response

  return {
    props: { post },
    revalidate: 60 * 30 // time to generate new page (one time a day) (Only for SSG)
  }
}