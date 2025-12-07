import type { PageServerLoad } from './$types';
import { getDb, type BlogPost } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const db = await getDb();
	const posts = await db.collection<BlogPost>('posts')
		.find({ published: true })
		.sort({ date: -1 })
		.toArray();
	
	return { 
		posts: posts.map(post => ({
			...post,
			_id: post._id?.toString()
		}))
	};
};
