import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getDb, type BlogPost } from '$lib/server/db';

const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

async function getPosts(): Promise<BlogPost[]> {
	const db = await getDb();
	const posts = await db.collection<BlogPost>('posts').find().toArray();
	return posts.map(post => ({
		...post,
		_id: post._id?.toString()
	}));
}

async function createPost(post: Omit<BlogPost, '_id'>): Promise<void> {
	const db = await getDb();
	await db.collection('posts').insertOne(post);
}

async function updatePost(id: string, post: Partial<BlogPost>): Promise<void> {
	const db = await getDb();
	await db.collection('posts').updateOne(
		{ id },
		{ $set: post }
	);
}

async function deletePost(id: string): Promise<void> {
	const db = await getDb();
	await db.collection('posts').deleteOne({ id });
}

export const load: PageServerLoad = async ({ cookies }) => {
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken === ADMIN_PASSWORD;
	
	if (!isAuthenticated) {
		return { isAuthenticated: false, posts: [] };
	}
	
	const posts = await getPosts();
	posts.sort((a, b) => 
		new Date(b.date).getTime() - new Date(a.date).getTime()
	);
	
	return { isAuthenticated: true, posts };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;
		
		if (password === ADMIN_PASSWORD) {
			cookies.set('admin_auth', ADMIN_PASSWORD, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: false,
				maxAge: 60 * 60 * 24 * 7
			});
			return { success: true };
		}
		return fail(401, { error: 'Invalid password' });
	},
	
	create: async ({ request, cookies }) => {
		if (cookies.get('admin_auth') !== ADMIN_PASSWORD) {
			return fail(401, { error: 'Unauthorized' });
		}
		
		const formData = await request.formData();
		const dateStr = formData.get('date') as string;
		const newPost: Omit<BlogPost, '_id'> = {
			id: Date.now().toString(),
			title: formData.get('title') as string,
			slug: formData.get('slug') as string,
			content: formData.get('content') as string,
			preview: formData.get('preview') as string,
			date: new Date(dateStr).toISOString(),
			published: formData.get('published') === 'on'
		};
		await createPost(newPost);
		return { success: true };
	},
	
	update: async ({ request, cookies }) => {
		if (cookies.get('admin_auth') !== ADMIN_PASSWORD) {
			return fail(401, { error: 'Unauthorized' });
		}
		
		const formData = await request.formData();
		const postId = formData.get('postId') as string;
		const dateStr = formData.get('date') as string;
		
		await updatePost(postId, {
			title: formData.get('title') as string,
			slug: formData.get('slug') as string,
			content: formData.get('content') as string,
			preview: formData.get('preview') as string,
			date: new Date(dateStr).toISOString(),
			published: formData.get('published') === 'on'
		});
		return { success: true };
	},
	
	delete: async ({ request, cookies }) => {
		if (cookies.get('admin_auth') !== ADMIN_PASSWORD) {
			return fail(401, { error: 'Unauthorized' });
		}
		
		const formData = await request.formData();
		const postId = formData.get('postId') as string;
		
		await deletePost(postId);
		return { success: true };
	}
};
