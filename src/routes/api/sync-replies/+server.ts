import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchNewReplies, getContacts, addReplyToContact, type Reply } from '$lib/server/email';
import { env } from '$env/dynamic/private';
import { convert } from 'html-to-text';

export const POST: RequestHandler = async ({ cookies }) => {
	const ADMIN_PASSWORD = env.ADMIN_PASSWORD;
	
	if (cookies.get('admin_auth') !== ADMIN_PASSWORD) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const newEmails = await fetchNewReplies();
		
		if (newEmails.length === 0) {
			return json({ 
				success: true, 
				message: 'No new replies found',
				count: 0 
			});
		}

		const contacts = await getContacts();
		let matchedCount = 0;

		for (const email of newEmails) {
			const subjectMatch = email.subject?.match(/#(\d+)/);
			const contactNumber = subjectMatch ? parseInt(subjectMatch[1]) : null;
			
			let contact = null;
			
			if (contactNumber !== null) {
				contact = contacts.find(c => c.contactNumber === contactNumber);
			}
			
			if (!contact) {
				contact = contacts.find(c => {
					const contactEmail = c.email.toLowerCase();
					const fromEmail = email.from?.toLowerCase() || '';
					const toEmail = email.to?.toLowerCase() || '';
					
					return fromEmail.includes(contactEmail) || toEmail.includes(contactEmail);
				});
			}

			if (contact) {
				let messageContent = email.text || '';
				
				if (!messageContent && email.html) {
					messageContent = convert(email.html, {
						wordwrap: 80,
						selectors: [
							{ selector: 'a', options: { ignoreHref: true } },
							{ selector: 'img', format: 'skip' }
						]
					});
				}

				messageContent = messageContent
					.split(/On .* wrote:/i)[0]
					.replace(/\n>.*$/gm, '')
					.replace(/\[.*?\]/g, '')
					.replace(/\n{3,}/g, '\n\n')
					.trim();

				if (!messageContent) continue;

				const reply: Reply = {
					id: Date.now().toString() + Math.random(),
					from: email.from || '',
					to: email.to || '',
					message: messageContent,
					date: email.date?.toISOString() || new Date().toISOString(),
					direction: 'received'
				};

				await addReplyToContact(contact.id, reply);
				matchedCount++;
			}
		}

		return json({ 
			success: true, 
			message: `Synced ${matchedCount} replies`,
			count: matchedCount,
			total: newEmails.length
		});
	} catch (error: any) {
		console.error('Sync error:', error);
		return json({ 
			success: false, 
			error: error.message || 'Failed to sync replies' 
		}, { status: 500 });
	}
};
