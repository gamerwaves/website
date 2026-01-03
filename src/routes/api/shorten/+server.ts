import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SHORT_IO_API_KEY, SHORT_IO_DOMAIN_ID } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	const { action, originalURL, path, tags, linkId } = await request.json();

	if (!SHORT_IO_API_KEY || !SHORT_IO_DOMAIN_ID) {
		return json({ error: 'Short.io API key or domain ID not configured' }, { status: 500 });
	}

	try {
		if (action === 'create') {
			const response = await fetch('https://api.short.io/links', {
				method: 'POST',
				headers: {
					accept: 'application/json',
					'content-type': 'application/json',
					Authorization: SHORT_IO_API_KEY
				},
				body: JSON.stringify({
					allowDuplicates: false,
					originalURL,
					domain: 'short.dwait.dev',
					...(path && { path }),
					...(tags && tags.length > 0 && { tags })
				})
			});

			const data = await response.json();

			if (!response.ok) {
				return json({ error: data.message || 'Failed to create short link' }, { status: response.status });
			}

			return json(data);
		} else if (action === 'update') {
			if (!linkId) {
				return json({ error: 'Link ID is required for update' }, { status: 400 });
			}

			const response = await fetch(`https://api.short.io/links/${linkId}`, {
				method: 'POST',
				headers: {
					accept: 'application/json',
					'content-type': 'application/json',
					Authorization: SHORT_IO_API_KEY
				},
				body: JSON.stringify({
					originalURL,
					...(path && { path }),
					...(tags && { tags })
				})
			});

			const data = await response.json();

			if (!response.ok) {
				return json({ error: data.message || 'Failed to update short link' }, { status: response.status });
			}

			return json(data);
		} else if (action === 'list') {
			try {
				const response = await fetch(
					`https://api.short.io/api/links?domain_id=${SHORT_IO_DOMAIN_ID}&limit=150`,
					{
						method: 'GET',
						headers: {
							accept: 'application/json',
							Authorization: SHORT_IO_API_KEY
						}
					}
				);

				const data = await response.json();

				if (!response.ok) {
					console.error('Short.io API error:', data);
					return json({ error: data.message || 'Failed to fetch links', details: data }, { status: response.status });
				}

				// Ensure we return links array in consistent format
				return json({ 
					links: data.links || [],
					count: data.count || 0,
					success: true
				});
			} catch (error) {
				console.error('Error fetching links:', error);
				return json({ error: 'Failed to fetch links', details: String(error) }, { status: 500 });
			}
		}

		return json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.error('Short.io API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
