import type { MongoClientOptions } from 'mongodb';
import { MongoClient } from 'mongodb';

import { environment } from '../../environments/environment';

export interface UnsafeFilterOptions {
  slug?: string;
  parent?: string;
}
const clientOptions: MongoClientOptions = {
  // https://github.com/mongodb/node-mongodb-native/blob/4.0/docs/CHANGES_4.0.0.md
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
};

const uri = `${environment.mongodb.url}/${environment.mongodb.databaseName}`;

/**
 * Do not use this function unless you know what you are doing.
 * build the unsafe connection, this query will directly connect to the database,
 * The payload draft will not be considered.
 */
export async function unsafeQueryMongo(collectionName: string, filter: UnsafeFilterOptions, count = 1) {
  let client: MongoClient | undefined;
  try {
    const client = new MongoClient(uri, clientOptions);
    // Connect to the MongoDB server
    await client.connect();
    const database = client.db();
    const collection = database.collection(collectionName);
    return await collection.find(filter).limit(count).skip(0).sort({ updatedAt: -1 }).toArray();
  } catch (err) {
    console.error(err);
  } finally {
    // close the connection
    if (client) {
      await client.close();
    }
  }
}
