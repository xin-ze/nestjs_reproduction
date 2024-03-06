import type {
  Article,
  Author,
  Media,
  NewsReport,
  ScheduledPublishTask,
  Config,
  PageLayout,
} from '../generated/payload-types';

export * from '../generated/payload-types';

export * from '../generated/PayloadRichText';

export type ArticleContent = NonNullable<Article['content']>;

export type CollectionSlug = keyof Config['collections'];
export type GlobalSlug = keyof Config['globals'];

export type Block = ArticleContent[number];

export type ContentBlock = Extract<Block, { blockType: 'content' }>;

export type RefinedNewsReport = Pick<NewsReport, 'title' | 'updatedAt' | 'createdAt' | 'migratedFrom'> &
  (
    | {
        type: 'internal';
        internalNewsArticle: string | Article;
      }
    | {
        type: 'external';
        externalLink: string;
        cover: string | Media;
        description: string;
        author: string | Author;
        publishedAt: Date;
      }
  );

export type RefinedScheduledPublishTask = Pick<
  ScheduledPublishTask,
  'id' | 'createdAt' | 'publishDate' | 'status' | 'updatedAt'
> &
  (
    | { type: 'collection'; documentSlug: string; collectionSlug: CollectionSlug; globalSlug?: never }
    | { type: 'global'; globalSlug: GlobalSlug; documentSlug?: never; collectionSlug?: never }
  );

export type LayoutBlockSection = NonNullable<PageLayout['blocks']>[number];
