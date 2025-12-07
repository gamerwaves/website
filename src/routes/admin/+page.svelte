<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { BlogPost } from '$lib/stores/blog';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	let isAuthenticated = data.isAuthenticated;
	let password = '';

	let posts = data.posts || [];
	let editingPost: BlogPost | null = null;
	let isCreating = false;

	let formData = {
		title: '',
		slug: '',
		content: '',
		preview: '',
		date: new Date().toISOString().split('T')[0],
		published: false
	};

	$: loginError = form?.error || '';

	function startCreating() {
		isCreating = true;
		editingPost = null;
		formData = {
			title: '',
			slug: '',
			content: '',
			preview: '',
			date: new Date().toISOString().split('T')[0],
			published: false
		};
	}

	function startEditing(post: BlogPost) {
		isCreating = false;
		editingPost = post;
		formData = {
			title: post.title,
			slug: post.slug,
			content: post.content,
			preview: post.preview,
			date: new Date(post.date).toISOString().split('T')[0],
			published: post.published
		};
	}

	function cancelEdit() {
		isCreating = false;
		editingPost = null;
	}

	function generateSlug() {
		formData.slug = formData.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	async function handleSave(e: Event) {
		e.preventDefault();
		
		const form = new FormData();
		form.append('title', formData.title);
		form.append('slug', formData.slug);
		form.append('content', formData.content);
		form.append('preview', formData.preview);
		form.append('date', formData.date);
		if (formData.published) form.append('published', 'on');
		if (editingPost) form.append('postId', editingPost.id);
		
		const action = editingPost ? 'update' : 'create';
		const response = await fetch(`/admin?/${action}`, {
			method: 'POST',
			body: form
		});

		if (response.ok) {
			window.location.reload();
		}
	}

	async function handleDelete(postId: string) {
		if (!confirm('Are you sure you want to delete this post?')) return;

		const form = new FormData();
		form.append('postId', postId);
		
		const response = await fetch('/admin?/delete', {
			method: 'POST',
			body: form
		});

		if (response.ok) {
			window.location.reload();
		}
	}
</script>

<div class="min-h-screen p-4 md:p-8">
	<div class="max-w-6xl mx-auto">
		{#if !isAuthenticated}
			<!-- Login Form -->
			<div class="max-w-md mx-auto">
				<div class="border-2 border-dashed border-[#47ccfc]/30 p-6 md:p-8">
					<div class="flex items-center justify-between mb-6 gap-4">
						<h1 class="text-2xl md:text-3xl font-bold text-[#47ccfc] font-mono">Admin Login</h1>
						<a href="/" class="text-[#47ccfc] hover:text-white transition-colors font-mono text-sm md:text-base whitespace-nowrap">← Back</a>
					</div>
					<form 
						method="POST" 
						action="?/login" 
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									window.location.reload();
								} else {
									await update();
								}
							};
						}}
						class="space-y-4"
					>
						<div>
							<label for="password" class="block text-[#47ccfc] mb-2 font-mono text-sm md:text-base">Password</label>
							<input
								type="password"
								id="password"
								name="password"
								bind:value={password}
								required
								class="w-full bg-transparent border-2 border-[#47ccfc]/30 p-2 md:p-3 text-[#47ccfc] font-mono text-sm md:text-base focus:outline-none focus:border-[#47ccfc]"
							/>
						</div>
						{#if loginError}
							<p class="text-red-500 font-mono text-xs md:text-sm">{loginError}</p>
						{/if}
						<button
							type="submit"
							class="w-full bg-[#47ccfc] text-[#2b2b2b] p-3 font-bold font-mono text-sm md:text-base hover:bg-[#47ccfc]/90 transition-colors"
						>
							LOGIN
						</button>
					</form>
				</div>
			</div>
		{:else}
			<!-- Admin Dashboard -->
			<div class="border-2 border-dashed border-[#47ccfc]/30 p-6 md:p-8 mb-4">
				<div class="flex items-center justify-between gap-4">
					<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-[#47ccfc] font-mono">Admin Dashboard</h1>
					<a href="/" class="text-[#47ccfc] hover:text-white transition-colors font-mono text-sm md:text-base whitespace-nowrap">← Home</a>
				</div>
			</div>

			<!-- Quick Links -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				<a href="/admin/contacts" class="border-2 border-dashed border-[#47ccfc]/30 p-6 hover:bg-[#47ccfc]/10 transition-colors">
					<h3 class="text-xl font-bold text-[#47ccfc] font-mono mb-2">📧 Contacts</h3>
					<p class="text-[#47ccfc]/80 font-mono text-sm">View and reply to contact form submissions</p>
				</a>
				<div class="border-2 border-dashed border-[#47ccfc]/30 p-6 opacity-50">
					<h3 class="text-xl font-bold text-[#47ccfc] font-mono mb-2">📝 Blog Posts</h3>
					<p class="text-[#47ccfc]/80 font-mono text-sm">Manage your blog posts below</p>
				</div>
			</div>

			{#if isCreating || editingPost}
				<!-- Post Editor -->
				<div class="border-2 border-dashed border-[#47ccfc]/30 p-6 md:p-8 mb-4">
					<h2 class="text-xl md:text-2xl font-bold text-[#47ccfc] font-mono mb-6">
						{editingPost ? 'Edit Post' : 'Create New Post'}
					</h2>
					<form on:submit={handleSave} class="space-y-4">
						<div>
							<label for="title" class="block text-[#47ccfc] mb-2 font-mono text-sm md:text-base">Title</label>
							<input
								type="text"
								id="title"
								bind:value={formData.title}
								on:blur={generateSlug}
								required
								class="w-full bg-transparent border-2 border-[#47ccfc]/30 p-2 md:p-3 text-[#47ccfc] font-mono text-sm md:text-base focus:outline-none focus:border-[#47ccfc]"
							/>
						</div>
						<div>
							<label for="slug" class="block text-[#47ccfc] mb-2 font-mono text-sm md:text-base">Slug</label>
							<input
								type="text"
								id="slug"
								bind:value={formData.slug}
								required
								class="w-full bg-transparent border-2 border-[#47ccfc]/30 p-2 md:p-3 text-[#47ccfc] font-mono text-sm md:text-base focus:outline-none focus:border-[#47ccfc]"
							/>
						</div>
						<div>
							<label for="preview" class="block text-[#47ccfc] mb-2 font-mono text-sm md:text-base">Preview</label>
							<textarea
								id="preview"
								bind:value={formData.preview}
								rows="2"
								required
								class="w-full bg-transparent border-2 border-[#47ccfc]/30 p-2 md:p-3 text-[#47ccfc] font-mono text-sm md:text-base focus:outline-none focus:border-[#47ccfc] resize-none"
							></textarea>
						</div>
						<div>
							<label for="date" class="block text-[#47ccfc] mb-2 font-mono text-sm md:text-base">Date</label>
							<input
								type="date"
								id="date"
								bind:value={formData.date}
								required
								class="w-full bg-transparent border-2 border-[#47ccfc]/30 p-2 md:p-3 text-[#47ccfc] font-mono text-sm md:text-base focus:outline-none focus:border-[#47ccfc]"
							/>
						</div>
						<div>
							<label for="content" class="block text-[#47ccfc] mb-2 font-mono text-sm md:text-base">Content</label>
							<textarea
								id="content"
								bind:value={formData.content}
								rows="15"
								required
								class="w-full bg-transparent border-2 border-[#47ccfc]/30 p-2 md:p-3 text-[#47ccfc] font-mono text-sm md:text-base focus:outline-none focus:border-[#47ccfc] resize-none"
							></textarea>
						</div>
						<div class="flex items-center gap-3">
							<input
								type="checkbox"
								id="published"
								bind:checked={formData.published}
								class="w-4 h-4 md:w-5 md:h-5 accent-[#47ccfc]"
							/>
							<label for="published" class="text-[#47ccfc] font-mono text-sm md:text-base">Published</label>
						</div>
						<div class="flex flex-col md:flex-row gap-4">
							<button
								type="submit"
								class="flex-1 bg-[#47ccfc] text-[#2b2b2b] p-3 font-bold font-mono text-sm md:text-base hover:bg-[#47ccfc]/90 transition-colors"
							>
								SAVE
							</button>
							<button
								type="button"
								on:click={cancelEdit}
								class="flex-1 border-2 border-[#47ccfc]/30 text-[#47ccfc] p-3 font-bold font-mono text-sm md:text-base hover:bg-[#47ccfc]/10 transition-colors"
							>
								CANCEL
							</button>
						</div>
					</form>
				</div>
			{:else}
				<!-- Post List -->
				<div class="border-2 border-dashed border-[#47ccfc]/30 p-6 md:p-8 mb-4">
					<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
						<h2 class="text-xl md:text-2xl font-bold text-[#47ccfc] font-mono">Blog Posts</h2>
						<button
							on:click={startCreating}
							class="bg-[#47ccfc] text-[#2b2b2b] px-4 md:px-6 py-2 font-bold font-mono text-sm md:text-base hover:bg-[#47ccfc]/90 transition-colors"
						>
							+ NEW POST
						</button>
					</div>

					{#if posts.length === 0}
						<p class="text-[#47ccfc]/60 font-mono text-sm md:text-base text-center py-8">No posts yet</p>
					{:else}
						<div class="space-y-4">
							{#each posts as post}
								<div class="border-2 border-dashed border-[#47ccfc]/30 p-4 md:p-6">
									<div class="flex flex-col gap-4">
										<div class="flex-1">
											<h3 class="text-lg md:text-xl font-bold text-[#47ccfc] font-mono mb-2">
												{post.title}
												{#if !post.published}
													<span class="text-xs md:text-sm text-[#47ccfc]/60">(Draft)</span>
												{/if}
											</h3>
											<p class="text-[#47ccfc]/80 font-mono text-xs md:text-sm mb-2">{post.preview}</p>
											<p class="text-[#47ccfc]/60 font-mono text-xs">
												{new Date(post.date).toLocaleDateString()}
											</p>
										</div>
										<div class="flex gap-2">
											<button
												on:click={() => startEditing(post)}
												class="border-2 border-[#47ccfc]/30 text-[#47ccfc] px-3 md:px-4 py-2 font-mono text-xs md:text-sm hover:bg-[#47ccfc]/10 transition-colors"
											>
												Edit
											</button>
											<button
												on:click={() => handleDelete(post.id)}
												class="border-2 border-red-500/30 text-red-500 px-3 md:px-4 py-2 font-mono text-xs md:text-sm hover:bg-red-500/10 transition-colors"
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>
