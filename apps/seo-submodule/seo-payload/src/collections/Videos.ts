import type { CollectionConfig } from 'payload/types';

// import { slugAsId } from '../fields';

export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['id', 'name', 'createdAt'],
    group: 'Media',
    listSearchableFields: ['id', 'name', 'url'],
  },
  access: {
    read: () => true,
  },
  fields: [
    // ...[
    //   // sidebar fields
    //   slugAsId({ trackingField: 'name' }),
    // ],
    {
      name: 'name',
      label: 'Name of the video (required)',
      type: 'text',
      required: true,
      maxLength: 256,
      admin: {
        description: 'Maximum 256 characters',
      },
    },
    {
      name: 'url',
      label: 'Link to the video(required)',
      type: 'text',
      required: true,
      admin: {
        description:
          'We currently support YouTube, Facebook, Twitch, SoundCloud, Streamable, Vimeo, Wistia, Mixcloud, DailyMotion and Kaltura links.',
      },
    },
    {
      name: 'cover',
      label: 'Cover image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'This image will be only used on mobile devices if Desktop cover image is specified.',
      },
    },
    {
      name: 'desktopCover',
      label: 'Desktop cover image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'This image will be used on desktop devices.',
      },
    },
  ],
  timestamps: true,
};
