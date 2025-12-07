import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

const MONGODB_URI = env.MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
	client = new MongoClient(MONGODB_URI);
	global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function getDb() {
	const client = await clientPromise;
	return client.db();
}

export interface BlogPost {
	_id?: string;
	id: string;
	title: string;
	slug: string;
	content: string;
	preview: string;
	date: string;
	published: boolean;
}
