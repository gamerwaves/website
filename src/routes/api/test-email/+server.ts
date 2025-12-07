import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createTransporter } from '$lib/server/email';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async () => {
	try {
		const transporter = createTransporter();
		
		await transporter.verify();
		
		return json({ 
			success: true, 
			message: 'SMTP connection successful',
			config: {
				host: env.SMTP_HOST,
				port: env.SMTP_PORT,
				user: env.SMTP_USER,
				passLength: env.SMTP_PASS?.length || 0,
				passPreview: env.SMTP_PASS?.substring(0, 3) + '***'
			}
		});
	} catch (error: any) {
		return json({ 
			success: false, 
			error: error.message,
			code: error.code,
			config: {
				host: env.SMTP_HOST,
				port: env.SMTP_PORT,
				user: env.SMTP_USER,
				passLength: env.SMTP_PASS?.length || 0,
				passPreview: env.SMTP_PASS?.substring(0, 3) + '***'
			}
		}, { status: 500 });
	}
};
