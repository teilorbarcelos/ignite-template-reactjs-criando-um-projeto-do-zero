import { format } from 'date-fns'
import Prismic from '@prismicio/client'
import Link from 'next/link'
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
  last_publication_date: string | null
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
  uid: string
}

interface PostProps {
  post: Post
  previousPost: Post
  nextPost: Post
}

export default function Post({
  post,
  previousPost,
  nextPost
}: PostProps) {
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

  function getUpdatedAt(date: string) {
    const time = date.split(/[\sT+:]+/)
    const formatedTime = `${time[1]}:${time[2]}`

    return formatedTime
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
          <h6><FiUser /> {post.data.author}</h6>
          <h6 className={styles.estimatedTime}><FiClock /> {readTime} min</h6>
        </div>
        <div className={styles.updatedAt}>
          <p>* editado em {
            dateFormat(post.last_publication_date)
          }, às {
              getUpdatedAt(post.last_publication_date)
            }</p>
        </div>

        {
          post.data.content.map((contentItem, index) => (
            <div key={index}>
              <h2>{contentItem.heading}</h2>
              {
                contentItem.body.map((bodyItem, index) => (
                  <p key={index}>{bodyItem.text}</p>
                ))
              }
            </div>
          ))
        }

        <div className={styles.divider}></div>

        <div className={styles.commentForm}>
          <div className={styles.othersPostsLinks}>
            <div>
              {
                previousPost &&
                <>
                  <p>{previousPost.data?.title}</p>
                  <Link href={`/post/${previousPost.uid}`}><a>Post anterior</a></Link>
                </>
              }
            </div>

            <div>
              {
                nextPost &&
                <>
                  <p>{nextPost.data?.title}</p>
                  <Link href={`/post/${nextPost.uid}`}><a>Próximo post</a></Link>
                </>
              }
            </div>
          </div>

          <div className={styles.outPreviewModeButton}>
            <p>Sair do modo Preview</p>
          </div>
        </div>
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

  const previousPostResponse = (await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    pageSize: 1,
    after: `${post.id}`,
    orderings: '[document.first_publication_date desc]'
  }))

  const nextPostResponse = (await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    pageSize: 1,
    after: `${post.id}`,
    orderings: '[document.first_publication_date]'
  }))

  const previousPost = previousPostResponse.results.length > 0 ?
    previousPostResponse.results[0] :
    null

  const nextPost = nextPostResponse.results.length > 0 ?
    nextPostResponse.results[0] :
    null

  return {
    props: {
      post,
      previousPost,
      nextPost
    },
    revalidate: 60 * 30 // time to generate new page (one time a day) (Only for SSG)
  }
}