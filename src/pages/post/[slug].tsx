import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import Prismic from '@prismicio/client'
import PrismicDOM from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';
import useUpdatePreview from '../../utils/useUpdatePreview'

import { PostInfo } from '../../components/PostInfo';
import { Comments } from '../../components/Comments';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import styles from './post.module.scss';
import Link from 'next/link';

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

export default function Post(props) {
  const router = useRouter();
  if(router.isFallback){
    return (
      <h1>Carregando...</h1>
    )
  }

  const { preview, previewRef, post } = props;

  const text = PrismicDOM.RichText.asText(post.data.content.reduce((acc, cur) => [...acc, ...cur.body], [] ));
  const words = text.split(/\W/);
  const time = Math.ceil(words.length/200);
  
  useUpdatePreview(previewRef, post.id)

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
    <div className={styles.updatedInfo}>
      *editado em { format(new Date(post.last_publication_date), 'dd MMM yyyy, HH:mm', {locale: ptBR}) }
    </div>
    {preview && (
    <aside className={styles.previewButton}>
      <Link href="/api/exit-preview">
        <a>Sair do modo Preview</a>
      </Link>
    </aside>
    )}
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
    <div className={styles.divider}></div>
    <div className={styles.relatedPostsContainer}>
      { post.data.previous_post.slug != undefined ?
        
        <div className={styles.relatedPost}>
          <p>{post.data.previous_post.slug.replace(/-/g, ' ')}</p>
          <Link href={`/post/${post.data.previous_post.uid}`}>
            <button>Previous post</button>
          </Link>
        </div> 
        
        : <div className={styles.relatedPost} />
      }
      {post.data.next_post.slug != undefined ? 
        
        <div className={styles.relatedPost}>
          <p>{post.data.next_post.slug.replace(/-/g, ' ')}</p>
          <Link href={`/post/${post.data.next_post.uid}`}>
            <button>Next post</button>
          </Link>
        </div> 
        
        : <div className={styles.relatedPost} />     
      }
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

  const preview = context.preview ? context.preview : false;
  const previewRef = context.previewData ? context.previewData.ref : null;
  const refOption = previewRef ? { ref: previewRef } : null;

  const prismic = getPrismicClient();
  const slug = context.params.slug;
  const queryOptions = {...refOption, fetchLinks: ['next_post', 'previous_post']};
  
  const response = await prismic.getByUID('article', slug, {...refOption, fetchLinks: ['next_post', 'previous_post']}) || {};

  return {
    props: {
      preview,
      previewRef,
      post: response
    }
  };
};
