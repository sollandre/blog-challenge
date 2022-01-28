import Prismic from '@prismicio/client';
import { DefaultClient } from '@prismicio/client/types/client';

export function getPrismicClient(req?: unknown): DefaultClient {
  const prismic = Prismic.client(process.env.PRISMIC_API_ENDPOINT, {
    req,
    accessToken: process.env.PRISMISC_ACCESS_TOKEN,
  });

  return prismic;
}

export const linkResolver = (doc) => {
  if (doc.type === 'article') {
    return `/post/${doc.uid}`
  }
  return '/'
}