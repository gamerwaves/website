import type { PageServerLoad } from './$types';
import { getDb, type BlogPost } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params }) => {
	const db = await getDb();
	const post = await db.collection<BlogPost>('posts').findOne({ slug: params.slug });
	
	if (!post || !post.published) {
		throw error(404, 'Post not found');
	}
	
	// Configure marked with custom heading renderer
	marked.use({
		renderer: {
			heading({ text, depth }: any) {
				const id = text
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/^-|-$/g, '');
				
				return `<h${depth} id="${id}">${text}</h${depth}>\n`;
			}
		}
	});
	
	const htmlContent = await marked(post.content);
	
	return {
		post: {
			...post,
			_id: post._id?.toString(),
			htmlContent
		}
	};
};
