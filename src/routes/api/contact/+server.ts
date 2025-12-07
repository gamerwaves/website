import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveContact, sendAutoReply, getNextContactNumber, type Contact } from '$lib/server/email';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name, email, message } = await request.json();

		if (!name || !email || !message) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}
		
		const contactNumber = await getNextContactNumber();

		const contact: Omit<Contact, '_id'> = {
			id: Date.now().toString(),
			contactNumber,
			name,
			email,
			message,
			date: new Date().toISOString(),
			replies: [],
			status: 'new'
		};

		await saveContact(contact);

		try {
			await sendAutoReply(email, name, message, contactNumber);
		} catch (emailError) {
			console.error('Failed to send auto-reply:', emailError);
		}

		return json({ success: true });
	} catch (error) {
		console.error('Contact form error:', error);
		return json({ error: 'Failed to save contact' }, { status: 500 });
	}
};
