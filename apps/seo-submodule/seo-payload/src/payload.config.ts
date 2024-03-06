import s3Upload from 'payload-s3-upload';
import { buildConfig } from 'payload/config';
import seo from '@payloadcms/plugin-seo';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { webpackBundler } from '@payloadcms/bundler-webpack';

import { adminWebpackConfig } from './adminWebpackConfig';
import { Videos } from './collections/Videos';
import { StyledThemeProvider } from './components/StyledThemeProvider';
import { RootProvider } from './components/RootProvider';
import { getCurrentEnvironment } from './environments/getCurrentEnvironment';

const environment = getCurrentEnvironment();

export default buildConfig({
  serverURL: environment.payload.serverUrl,
  admin: {
    webpack: adminWebpackConfig,
    bundler: webpackBundler(), // bundler-config
    components: {
      providers: [StyledThemeProvider, RootProvider],
    },
  },
  editor: lexicalEditor({}),
  db: mongooseAdapter({
    url: `${environment.mongodb.url}/${environment.mongodb.databaseName}`,
    // https://github.com/payloadcms/payload/issues/4332
    connectOptions: {
      // Auto index not supported by read replicas
      autoIndex: false,
      autoCreate: false,
      dbName: environment.mongodb.databaseName,
    }
  }),
  collections: [
    Videos,
  ],
  // globals,
  typescript: {
    outputFile: 'libs/seo-submodule/payload-types/src/generated/payload-types.ts',
  },
  graphQL: {
    disablePlaygroundInProduction: environment.deployEnv === 'prod',
  },

  // for migrating cold data, set rate limit with larger number
  rateLimit: { window: 1000, max: 500 },

  plugins: [
    s3Upload(),
    // addAuditInfoPlugin(),
    // relationshipLinksPlugin(),
    seo({
      collections: ['qnas'],
      uploadsCollection: 'media',
      fields: [
        {
          name: 'noIndex',
          label: 'Hide page from search engines (noindex)',
          type: 'checkbox',
        },
      ],
    }),
  ],
});
