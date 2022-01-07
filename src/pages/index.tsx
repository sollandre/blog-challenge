import { GetStaticProps } from 'next';
import Link from 'next/link'
import { useState } from 'react';

import Prismic from '@prismicio/client'

import { FiCalendar } from 'react-icons/fi'
import { FiUser } from 'react-icons/fi'

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getPrismicClient } from '../services/prismic';
import { PostInfo } from "../components/PostInfo";
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function dateFormat(date: string) {
  return format(new Date(date), 'dd MMM yyyy', {locale: ptBR});
};

function parsePost({ uid, first_publication_date, data }:Post) {
  return {
    uid,
    first_publication_date,
    data: {
      title: data.title,
      subtitle: data.subtitle,
      author: data.author
    }
  }
}


export default function Home(props: HomeProps) {
  const {next_page, results} = props.postsPagination;

  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  const loadPosts = async () => {
    const response = await fetch(nextPage);
    const newPosts :PostPagination  = await response.json();

    const parsedPosts = newPosts.results.map((post) => parsePost(post))

    setPosts([
      ...posts, 
      ...parsedPosts
    ])

    setNextPage(newPosts.next_page);
  }
  
  const formattedPosts = posts.map((post) => {
    return (
      <div className={styles.container} key={post.uid}>
          <Link href={`/post/${post.uid}`}>
            <a className={styles.title}>{post.data.title}</a>
          </Link>
          <p className={styles.subtitle}>{post.data.subtitle}</p>
          <div className={styles.informationContainer}>
            <PostInfo
              icon={<FiCalendar />}
              text={dateFormat(post.first_publication_date)}
              />
            <PostInfo
              icon={<FiUser />}
              text={post.data.author}
            />
          </div>
        </div>
   )
  })

  return (
    <>
      {formattedPosts}
      { nextPage ? 
        <button className={styles.load} onClick={() => loadPosts()}>
          Carregar mais posts
        </button> 
        :
        <>
        </>
      }
    </>
  )


}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'article'), 
    {
      pageSize: 1,
      graphQuery: `{
        article
        {
          title
          subtitle
          author
        }
      }`
    }
  );

  // console.log(JSON.stringify(postsResponse, null, 2));

  const next_page = postsResponse.next_page;

  const results = postsResponse.results.map((post) => parsePost(post))

  return {
    props: {postsPagination: {next_page, results}},
    revalidate: 60*60*2 //every 2h 
  }
};
