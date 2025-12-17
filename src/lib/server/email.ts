import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { env } from '$env/dynamic/private';
import { getDb } from './db';

export interface Contact {
	_id?: string;
	id: string;
	contactNumber: number;
	name: string;
	email: string;
	message: string;
	date: string;
	replies: Reply[];
	status: 'new' | 'replied' | 'closed';
}

export interface Reply {
	id: string;
	from: string;
	to: string;
	message: string;
	date: string;
	direction: 'sent' | 'received';
}

// Create SMTP transporter
export function createTransporter() {
  const port = parseInt(env.SMTP_PORT || '587', 10);
  const secure = port === 465; // true only for port 465

  const options: SMTPTransport.Options = {
    host: env.SMTP_HOST,
    port,
    secure,

    requireTLS: true, // Nest requires STARTTLS

    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    },

    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1'
    },

    // Nest does NOT support pool, remove it completely
    // pool: false,

    debug: true,
    logger: true
  };

  return nodemailer.createTransport(options);
}


// Convert markdown to HTML for emails
function markdownToHtml(text: string): string {
	return text
		// Headers: # H1, ## H2, ### H3
		.replace(/^### (.+)$/gm, '<h3 style="font-size: 1.17em; font-weight: bold; margin: 1em 0 0.5em 0;">$1</h3>')
		.replace(/^## (.+)$/gm, '<h2 style="font-size: 1.5em; font-weight: bold; margin: 1em 0 0.5em 0;">$1</h2>')
		.replace(/^# (.+)$/gm, '<h1 style="font-size: 2em; font-weight: bold; margin: 1em 0 0.5em 0;">$1</h1>')
		// Bold: **text** or __text__
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/__(.+?)__/g, '<strong>$1</strong>')
		// Italic: *text* or _text_
		.replace(/\*(.+?)\*/g, '<em>$1</em>')
		.replace(/_(.+?)_/g, '<em>$1</em>')
		// Code: `code`
		.replace(/`(.+?)`/g, '<code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
		// Links: [text](url)
		.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #0066cc; text-decoration: underline;">$1</a>')
		// Line breaks
		.replace(/\n/g, '<br>');
}

// Send email reply
export async function sendReply(to: string, subject: string, message: string, contactNumber?: number, inReplyTo?: string) {
	const transporter = createTransporter();
	
	// Add contact number to subject if provided
	const finalSubject = contactNumber !== undefined 
		? `${subject} #${contactNumber}`
		: subject;
	
	// Convert markdown to HTML
	const htmlContent = markdownToHtml(message);
	
	// Create a nice HTML email template
	const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	${htmlContent}
	<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
	<p style="color: #999; font-size: 12px;">
		Dwait Pandhi<br>
		<a href="mailto:${env.SMTP_USER}" style="color: #0066cc;">${env.SMTP_USER}</a>
	</p>
</body>
</html>`;
	
	const mailOptions: any = {
		from: env.SMTP_USER,
		to,
		subject: finalSubject,
		text: message, // Plain text fallback
		html: htmlEmail
	};

	if (inReplyTo) {
		mailOptions.inReplyTo = inReplyTo;
		mailOptions.references = inReplyTo;
	}

	const info = await transporter.sendMail(mailOptions);
	return info;
}

// Fetch new replies from IMAP
export async function fetchNewReplies(): Promise<any[]> {
	return new Promise((resolve, reject) => {
		const imap = new Imap({
			user: env.IMAP_USER,
			password: env.IMAP_PASS,
			host: env.IMAP_HOST,
			port: parseInt(env.IMAP_PORT || '993'),
			tls: true,
			tlsOptions: { 
				rejectUnauthorized: false,
				minVersion: 'TLSv1'
			}
		});

		const messages: any[] = [];

		imap.once('ready', () => {
			imap.openBox('INBOX', false, (err) => {
				if (err) {
					reject(err);
					return;
				}

				// Search for unseen messages
				imap.search(['UNSEEN'], (err, results) => {
					if (err) {
						reject(err);
						return;
					}

					if (!results || results.length === 0) {
						imap.end();
						resolve([]);
						return;
					}

					const fetch = imap.fetch(results, { 
						bodies: '',
						markSeen: true // Mark as seen to prevent duplicates
					});

					fetch.on('message', (msg) => {
						msg.on('body', (stream) => {
							simpleParser(stream as any, (err, parsed) => {
								if (err) return;
								const fromAddress = Array.isArray(parsed.from) ? parsed.from[0] : parsed.from;
								const toAddress = Array.isArray(parsed.to) ? parsed.to[0] : parsed.to;
								messages.push({
									from: fromAddress?.text || '',
									to: toAddress?.text || '',
									subject: parsed.subject,
									text: parsed.text,
									html: parsed.html,
									date: parsed.date,
									messageId: parsed.messageId,
									inReplyTo: parsed.inReplyTo
								});
							});
						});
					});

					fetch.once('end', () => {
						imap.end();
					});
				});
			});
		});

		imap.once('error', (err: Error) => {
			reject(err);
		});

		imap.once('end', () => {
			resolve(messages);
		});

		imap.connect();
	});
}

// Save contact to database
export async function saveContact(contact: Omit<Contact, '_id'>): Promise<void> {
	const db = await getDb();
	await db.collection('contacts').insertOne(contact);
}

// Get all contacts
export async function getContacts(): Promise<Contact[]> {
	const db = await getDb();
	const contacts = await db.collection<Contact>('contacts')
		.find()
		.sort({ date: -1 })
		.toArray();
	
	return contacts.map(contact => ({
		...contact,
		_id: contact._id?.toString()
	}));
}

// Get single contact
export async function getContact(id: string): Promise<Contact | null> {
	const db = await getDb();
	const contact = await db.collection<Contact>('contacts').findOne({ id });
	
	if (!contact) return null;
	
	return {
		...contact,
		_id: contact._id?.toString()
	};
}

// Add reply to contact
export async function addReplyToContact(contactId: string, reply: Reply): Promise<void> {
	const db = await getDb();
	await db.collection('contacts').updateOne(
		{ id: contactId },
		{ 
			$push: { replies: reply } as any,
			$set: { status: 'replied' }
		}
	);
}

// Update contact status
export async function updateContactStatus(contactId: string, status: Contact['status']): Promise<void> {
	const db = await getDb();
	await db.collection('contacts').updateOne(
		{ id: contactId },
		{ $set: { status } }
	);
}

// Get next contact number (global counter)
export async function getNextContactNumber(): Promise<number> {
	const db = await getDb();
	const result = await db.collection('contacts')
		.find()
		.sort({ contactNumber: -1 })
		.limit(1)
		.toArray();
	
	return result.length > 0 ? (result[0].contactNumber || 0) + 1 : 0;
}

// Send auto-reply when form is submitted
export async function sendAutoReply(to: string, name: string, message: string, contactNumber: number): Promise<void> {
	const transporter = createTransporter();
	
	const subject = `Re: Your message to Dwait Pandhi #${contactNumber}`;
	const emailBody = `Hi ${name},

Thank you for reaching out! I've received your message:

"${message}"

I'll get back to you as soon as possible.

Best regards,
Dwait Pandhi`;

	await transporter.sendMail({
		from: env.SMTP_USER,
		to,
		subject,
		text: emailBody,
		html: emailBody.replace(/\n/g, '<br>')
	});
}
