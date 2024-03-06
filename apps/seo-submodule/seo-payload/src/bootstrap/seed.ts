/**
 * Refer: https://github.com/payloadcms/public-demo/blob/306ba9b1b9d648cfece648333bcc824db0b7af36/src/cron/reset.ts
 */

import path from 'path';

import payload from 'payload';
import { MongoClient } from 'mongodb';

import { environment } from '../environments/environment';

/**
 * Seed database
 */
export async function seed() {
  try {
    payload.logger.info(`Seeding database...`);

    await seedData();
    payload.logger.info(`Seed Complete.`);
  } catch (error) {
    console.error(error);
    payload.logger.error('Error seeding database.');
  }
}

/**
 * Reset database
 */
export async function reset() {
  try {
    payload.logger.info(`Resetting database...`);

    await dropDB();
    await seedData();
    payload.logger.info(`Reset Complete.`);
  } catch (error) {
    console.error(error);
    payload.logger.error('Error resetting database.');
  }
}

/**
 * Drop database
 */
async function dropDB() {
  const client = await MongoClient.connect(environment.mongodb.url);
  const db = client.db(new URL(environment.mongodb.url).pathname.substring(1));
  await db.dropDatabase();
}

/**
 * Seed data
 */
async function seedData() {
  // __dirname will be inside the dist folder after build
  const seoPayloadRootDir = __dirname;

  const existingUsers = await payload.find({
    collection: 'users',
    limit: 1,
  });

  // skip seeding if users exist
  if (existingUsers.totalDocs) return;

  await seedCategories();

  await payload.create({
    collection: 'users',
    data: {
      name: 'Payload Admin',
      email: 'payload-admin@getjerry.com',
      password: 'payload-admin',
      roles: ['admin'],
    },
  });

  await payload.create({
    collection: 'users',
    data: {
      name: 'Payload Test',
      email: 'payload-test@getjerry.com',
      password: 'payload-test',
      roles: ['admin'],
    },
  });

  await payload.create({
    collection: 'media',
    data: {
      alt: 'Demo: Car Cover',
      slug: 'demo-car-cover',
    },
    filePath: path.resolve(seoPayloadRootDir, './assets/car-cover.jpg'),
  });

  const { id: avatarId } = await payload.create({
    collection: 'media',
    data: {
      alt: 'Demo: Author Avatar',
      slug: 'demo-author-avatar',
    },
    filePath: path.resolve(seoPayloadRootDir, './assets/author-avatar.png'),
  });

  await payload.create({
    collection: 'authors',
    data: {
      id: 'demo-author',
      name: 'Demo Author',
      title: 'Demo Author Title',
      bio: 'Demo Author Bio',
      bioSummary: 'Demo Author Bio Summary',
      roles: ['editor', 'reviewer', 'writer'],
      education: [{ children: [{ text: 'Demo Author Education' }] }],
      expertise: [{ children: [{ text: 'Demo Author Expertise' }] }],
      certifications: [{ children: [{ text: 'Demo Author Certifications' }] }],
      workHistory: [{ children: [{ text: 'Demo Author Work History' }] }],
      bioRichText: [{ children: [{ text: 'Demo Author Bio Rich Text' }] }],
      avatar: avatarId,
    },
  });

  await payload.create({
    collection: 'authors',
    data: {
      id: 'demo-editor',
      name: 'Demo Editor',
      title: 'Demo Editor Title',
      bio: 'Demo Editor Bio',
      bioSummary: 'Demo Editor Bio Summary',
      roles: ['editor', 'reviewer', 'writer'],
      education: [{ children: [{ text: 'Demo Editor Education' }] }],
      expertise: [{ children: [{ text: 'Demo Editor Expertise' }] }],
      certifications: [{ children: [{ text: 'Demo Editor Certifications' }] }],
      workHistory: [{ children: [{ text: 'Demo Editor Work History' }] }],
      bioRichText: [{ children: [{ text: 'Demo Editor Bio Rich Text' }] }],
      avatar: avatarId,
    },
  });

  await payload.create({
    collection: 'authors',
    data: {
      id: 'demo-reviewer',
      name: 'Demo Reviewer',
      title: 'Demo Reviewer Title',
      bio: 'Demo Reviewer Bio',
      bioSummary: 'Demo Reviewer Bio Summary',
      roles: ['editor', 'reviewer', 'writer'],
      education: [{ children: [{ text: 'Demo Reviewer Education' }] }],
      expertise: [{ children: [{ text: 'Demo Reviewer Expertise' }] }],
      certifications: [{ children: [{ text: 'Demo Reviewer Certifications' }] }],
      workHistory: [{ children: [{ text: 'Demo Reviewer Work History' }] }],
      bioRichText: [{ children: [{ text: 'Demo Reviewer Bio Rich Text' }] }],
      avatar: avatarId,
    },
  });
}

/**
 * Seed categories data
 *
 */
async function seedCategories() {
  const existingCategories = await payload.find({
    collection: 'categories',
    limit: 1,
  });

  // skip seeding if categories exist
  if (existingCategories.totalDocs) return;

  await payload.create({
    collection: 'categories',
    data: {
      id: 'demo',
      name: 'Demo',
    },
  });
}
