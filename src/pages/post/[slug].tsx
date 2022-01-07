import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import PrismicH from '@prismicio/helpers'
import PrismicDOM from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';

import { PostInfo } from '../../components/PostInfo';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { useRouter } from 'next/router';
import { Comments } from '../../components/Comments';

interface PostPagination {
  next_page: string;
  results: [
    {
      uid: string;
    }
  ]
}
interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

function dateFormat(date: string) {
  return format(new Date(date), 'dd MMM yyyy', {locale: ptBR});
};

function parsePost(section) {
  const heading = section.heading;
  const paragraphs = section.body.map((paragraph) => paragraph.text)

  return {
    heading,
    paragraphs
  }
}

export default function Post(props: PostProps) {
  const router = useRouter();
  if(router.isFallback){
    return (
      <h1>Carregando...</h1>
    )
  }

  const { post } = props;

  const text = PrismicDOM.RichText.asText(post.data.content.reduce((acc, cur) => [...acc, ...cur.body], [] ));
  const words = text.split(/\W/);
  const time = Math.ceil(words.length/200);

  return (
   <main className={styles.container}>
   <div className={styles.banner}>
    <img src={post.data.banner.url} />
   </div>
    <h1 className={styles.title}>{post.data.title}</h1>

    <div className={styles.infoContainer}>
      <PostInfo
        icon={<FiCalendar />}
        text={dateFormat(post.first_publication_date)}
      />
      <PostInfo
        icon={<FiUser />}
        text={post.data.author}
      />
      <PostInfo
        icon={<FiClock />}
        text={`${time} min`}
      />
    </div>
    <div className={styles.content}>
      {post.data.content.map(
        (section, index) => {
          const { heading, paragraphs} = parsePost(section);
          const formattedParagraphs = paragraphs.map((text, index) => <p key={index}>{text}</p> )

          return (
            <section key={heading}>
              <h2>{heading}</h2>
              {formattedParagraphs}    
            </section>
          )
        }
      )}
    </div>
    <Comments commentNodeId="comments" />
   </main>
 )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  
  const response = await prismic.query(
    Prismic.Predicates.at('document.type', 'article'), 
    {
      pageSize: 1,
      graphQuery: `{
        article
        {
          uid
        }
      }`
    }
  );
    
  let paths = response.results.map((post) => {
    return { params: {slug: post.uid } } 
    });
  let next_page = response.next_page;

  while(next_page){
    const newPage: PostPagination = await fetch(next_page).then((response) => response.json());
    const newPosts = newPage.results.map((post) =>{
      return { params: { slug: post.uid } }
    });
    paths = [...paths, ...newPosts];
    next_page = newPage.next_page;
  };


  return {
    paths: paths,
    fallback: true,
  }
};

export const getStaticProps = async context => {
  const prismic = getPrismicClient();
  const slug = context.params.slug;
  const response = await prismic.getByUID('article', slug, null);

  return {
    props: {
      post: response
    }
  };
};
