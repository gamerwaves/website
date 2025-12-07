import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { env } from '$env/dynamic/private';
import { convert } from 'html-to-text';

export const POST: RequestHandler = async ({ cookies }) => {
	const ADMIN_PASSWORD = env.ADMIN_PASSWORD;
	
	if (cookies.get('admin_auth') !== ADMIN_PASSWORD) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const db = await getDb();
		const contacts = await db.collection('contacts').find().toArray();
		
		let updatedCount = 0;

		for (const contact of contacts) {
			if (!contact.replies || contact.replies.length === 0) continue;

			const seenMessages = new Set();
			const cleanedReplies = [];

			for (const reply of contact.replies) {
				const key = `${reply.from}-${reply.date}-${reply.message.substring(0, 50)}`;
				
				if (seenMessages.has(key)) {
					continue;
				}
				seenMessages.add(key);

				let message = reply.message;
				if (message.includes('<!DOCTYPE html>') || message.includes('<html')) {
					message = convert(message, {
						wordwrap: 80,
						selectors: [
							{ selector: 'a', options: { ignoreHref: true } },
							{ selector: 'img', format: 'skip' },
							{ selector: 'style', format: 'skip' },
							{ selector: 'script', format: 'skip' }
						]
					});
					
					message = message
						.replace(/\[.*?\]/g, '')
						.replace(/\n{3,}/g, '\n\n')
						.trim();
				}

				cleanedReplies.push({
					...reply,
					message
				});
			}

			if (cleanedReplies.length !== contact.replies.length) {
				await db.collection('contacts').updateOne(
					{ _id: contact._id },
					{ $set: { replies: cleanedReplies } }
				);
				updatedCount++;
			}
		}

		return json({ 
			success: true, 
			message: `Cleaned up ${updatedCount} contacts`,
			count: updatedCount
		});
	} catch (error: any) {
		console.error('Cleanup error:', error);
		return json({ 
			success: false, 
			error: error.message 
		}, { status: 500 });
	}
};
