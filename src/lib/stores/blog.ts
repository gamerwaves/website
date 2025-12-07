export interface BlogPost {
	_id?: string;
	id: string;
	title: string;
	slug: string;
	content: string;
	preview: string;
	date: string;
	published: boolean;
	htmlContent?: string;
}

export const blogPosts: BlogPost[] = [];
