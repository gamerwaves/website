import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { 
	getContacts, 
	getContact, 
	addReplyToContact, 
	sendReply, 
	updateContactStatus,
	type Reply 
} from '$lib/server/email';

const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

export const load: PageServerLoad = async ({ cookies }) => {
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken === ADMIN_PASSWORD;
	
	if (!isAuthenticated) {
		throw redirect(302, '/admin');
	}
	
	const contacts = await getContacts();
	
	return { contacts };
};

export const actions: Actions = {
	reply: async ({ request, cookies }) => {
		if (cookies.get('admin_auth') !== ADMIN_PASSWORD) {
			return fail(401, { error: 'Unauthorized' });
		}
		
		const formData = await request.formData();
		const contactId = formData.get('contactId') as string;
		const replyMessage = formData.get('message') as string;
		
		const contact = await getContact(contactId);
		if (!contact) {
			return fail(404, { error: 'Contact not found' });
		}
		
		try {
			const subject = `Re: Your message to Dwait Pandhi`;
			await sendReply(contact.email, subject, replyMessage, contact.contactNumber);
			
			const reply: Reply = {
				id: Date.now().toString(),
				from: env.SMTP_USER || '',
				to: contact.email,
				message: replyMessage,
				date: new Date().toISOString(),
				direction: 'sent'
			};
			
			await addReplyToContact(contactId, reply);
			
			return { success: true };
		} catch (error: any) {
			console.error('Reply error:', error);
			const errorMessage = error.code === 'EAUTH' 
				? 'Email authentication failed. Check your SMTP credentials in .env file.'
				: error.message || 'Failed to send reply';
			return fail(500, { error: errorMessage });
		}
	},
	
	updateStatus: async ({ request, cookies }) => {
		if (cookies.get('admin_auth') !== ADMIN_PASSWORD) {
			return fail(401, { error: 'Unauthorized' });
		}
		
		const formData = await request.formData();
		const contactId = formData.get('contactId') as string;
		const status = formData.get('status') as 'new' | 'replied' | 'closed';
		
		await updateContactStatus(contactId, status);
		
		return { success: true };
	}
};
