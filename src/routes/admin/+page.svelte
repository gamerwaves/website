<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { BlogPost } from '$lib/stores/blog';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	let isAuthenticated = data.isAuthenticated;
	let password = '';
	let activeTab: 'blog' | 'contacts' = 'blog';

	let posts = data.posts || [];
	let editingPost: BlogPost | null = null;
	let isCreating = false;

	let selectedContact: any = null;
	let replyMessage = '';
	let filterStatus: 'all' | 'new' | 'replied' | 'closed' = 'all';
	let errorMessage = '';
	let syncMessage = '';
	let isSyncing = false;
	let isCleaning = false;

	$: filteredContacts = filterStatus === 'all' 
		? data.contacts 
		: data.contacts.filter((c: any) => c.status === filterStatus);

	function formatMessage(text: string): string {
		return text
			.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-[#47ccfc] mt-4 mb-2">$1</h3>')
			.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[#47ccfc] mt-4 mb-2">$1</h2>')
			.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-[#47ccfc] mt-4 mb-2">$1</h1>')
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/__(.+?)__/g, '<strong>$1</strong>')
			.replace(/\*(.+?)\*/g, '<em>$1</em>')
			.replace(/_(.+?)_/g, '<em>$1</em>')
			.replace(/`(.+?)`/g, '<code class="bg-[#47ccfc]/10 px-1 rounded">$1</code>')
			.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-400 underline" target="_blank">$1</a>')
			.replace(/\n/g, '<br>');
	}

	function selectContact(contact: any) {
		selectedContact = contact;
		replyMessage = '';
	}

	function closeDetail() {
		selectedContact = null;
		replyMessage = '';
	}

	async function syncReplies() {
		isSyncing = true;
		syncMessage = '';
		
		try {
			const response = await fetch('/api/sync-replies', {
				method: 'POST'
			});
			
			const result = await response.json();
			
			if (result.success) {
				syncMessage = result.message;
				setTimeout(() => {
					window.location.reload();
				}, 1000);
			} else {
				syncMessage = 'Error: ' + result.error;
			}
		} catch (error) {
			syncMessage = 'Failed to sync replies';
		} finally {
			isSyncing = false;
			setTimeout(() => syncMessage = '', 5000);
		}
	}

	async function cleanupContacts() {
		isCleaning = true;
		syncMessage = '';
		
		try {
			const response = await fetch('/api/cleanup-contacts', {
				method: 'POST'
			});
			
			const result = await response.json();
			
			if (result.success) {
				syncMessage = result.message;
				setTimeout(() => {
					window.location.reload();
				}, 1000);
			} else {
				syncMessage = 'Error: ' + result.error;
			}
		} catch (error) {
			syncMessage = 'Failed to cleanup';
		} finally {
			isCleaning = false;
			setTimeout(() => syncMessage = '', 5000);
		}
	}

	async function handleContactReply(e: Event) {
		e.preventDefault();
		if (!selectedContact || !replyMessage.trim()) return;

		const form = new FormData();
		form.append('contactId', selectedContact.id);
		form.append('message', replyMessage);

		const response = await fetch('?/reply', {
			method: 'POST',
			body: form
		});

		if (response.ok) {
			window.location.reload();
		}
	}

	async function updateContactStatus(contactId: string, status: 'new' | 'replied' | 'closed') {
		const form = new FormData();
		form.append('contactId', contactId);
		form.append('status', status);

		const response = await fetch('?/updateStatus', {
			method: 'POST',
			body: form
		});

		if (response.ok) {
			window.location.reload();
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'new': return 'text-green-500';
			case 'replied': return 'text-blue-500';
			case 'closed': return 'text-gray-500';
			default: return 'text-[#47ccfc]';
		}
	}

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
				<div class="flex items-center justify-between gap-4 mb-6">
					<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-[#47ccfc] font-mono">Admin Dashboard</h1>
					<a href="/" class="text-[#47ccfc] hover:text-white transition-colors font-mono text-sm md:text-base whitespace-nowrap">← Home</a>
				</div>
				
				<div class="flex gap-2 border-t-2 border-dashed border-[#47ccfc]/30 pt-4">
					<button
						on:click={() => activeTab = 'blog'}
						class="px-4 md:px-6 py-2 font-mono text-sm md:text-base font-bold transition-colors {activeTab === 'blog' ? 'bg-[#47ccfc] text-[#2b2b2b]' : 'border-2 border-[#47ccfc]/30 text-[#47ccfc] hover:bg-[#47ccfc]/10'}"
					>
						Blog Posts
					</button>
					<button
						on:click={() => activeTab = 'contacts'}
						class="px-4 md:px-6 py-2 font-mono text-sm md:text-base font-bold transition-colors {activeTab === 'contacts' ? 'bg-[#47ccfc] text-[#2b2b2b]' : 'border-2 border-[#47ccfc]/30 text-[#47ccfc] hover:bg-[#47ccfc]/10'}"
					>
						Contacts
					</button>
				</div>
			</div>

			{#if activeTab === 'blog'}
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
			{:else if activeTab === 'contacts'}
				<div class="mb-4">
					{#if syncMessage}
						<div class="p-3 border-2 border-dashed border-[#47ccfc]/30 text-[#47ccfc] font-mono text-xs mb-4">
							{syncMessage}
						</div>
					{/if}

					<div class="border-2 border-dashed border-[#47ccfc]/30 p-4 md:p-6 mb-4">
						<div class="flex items-center justify-between gap-4 mb-4">
							<h2 class="text-xl font-bold text-[#47ccfc] font-mono">Contacts</h2>
							<div class="flex items-center gap-2">
								<button
									on:click={syncReplies}
									disabled={isSyncing}
									class="px-3 md:px-4 py-2 bg-[#47ccfc] text-[#2b2b2b] font-mono text-xs md:text-sm font-bold hover:bg-[#47ccfc]/90 transition-colors disabled:opacity-50"
								>
									{isSyncing ? 'SYNCING...' : 'SYNC'}
								</button>
								<button
									on:click={cleanupContacts}
									disabled={isCleaning}
									class="px-3 md:px-4 py-2 border-2 border-[#47ccfc]/30 text-[#47ccfc] font-mono text-xs md:text-sm font-bold hover:bg-[#47ccfc]/10 transition-colors disabled:opacity-50"
								>
									{isCleaning ? 'CLEANING...' : 'CLEANUP'}
								</button>
							</div>
						</div>
						<div class="flex gap-2 flex-wrap">
							<button
								on:click={() => filterStatus = 'all'}
								class="px-4 py-2 font-mono text-sm {filterStatus === 'all' ? 'bg-[#47ccfc] text-[#2b2b2b]' : 'border-2 border-[#47ccfc]/30 text-[#47ccfc]'} hover:bg-[#47ccfc]/90 transition-colors"
							>
								All ({data.contacts.length})
							</button>
							<button
								on:click={() => filterStatus = 'new'}
								class="px-4 py-2 font-mono text-sm {filterStatus === 'new' ? 'bg-[#47ccfc] text-[#2b2b2b]' : 'border-2 border-[#47ccfc]/30 text-[#47ccfc]'} hover:bg-[#47ccfc]/90 transition-colors"
							>
								New ({data.contacts.filter((c: any) => c.status === 'new').length})
							</button>
							<button
								on:click={() => filterStatus = 'replied'}
								class="px-4 py-2 font-mono text-sm {filterStatus === 'replied' ? 'bg-[#47ccfc] text-[#2b2b2b]' : 'border-2 border-[#47ccfc]/30 text-[#47ccfc]'} hover:bg-[#47ccfc]/90 transition-colors"
							>
								Replied ({data.contacts.filter((c: any) => c.status === 'replied').length})
							</button>
							<button
								on:click={() => filterStatus = 'closed'}
								class="px-4 py-2 font-mono text-sm {filterStatus === 'closed' ? 'bg-[#47ccfc] text-[#2b2b2b]' : 'border-2 border-[#47ccfc]/30 text-[#47ccfc]'} hover:bg-[#47ccfc]/90 transition-colors"
							>
								Closed ({data.contacts.filter((c: any) => c.status === 'closed').length})
							</button>
						</div>
					</div>

					<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div class="border-2 border-dashed border-[#47ccfc]/30 p-4 md:p-6">
							<h2 class="text-xl font-bold text-[#47ccfc] font-mono mb-4">Messages</h2>
							
							{#if filteredContacts.length === 0}
								<p class="text-[#47ccfc]/60 font-mono text-sm text-center py-8">No contacts found</p>
							{:else}
								<div class="space-y-3 max-h-[600px] overflow-y-auto">
									{#each filteredContacts as contact}
										<button
											on:click={() => selectContact(contact)}
											class="w-full text-left border-2 border-dashed border-[#47ccfc]/30 p-4 hover:bg-[#47ccfc]/10 transition-colors {selectedContact?.id === contact.id ? 'bg-[#47ccfc]/10' : ''}"
										>
											<div class="flex items-start justify-between gap-2 mb-2">
												<div class="flex items-center gap-2">
													<span class="text-[#47ccfc]/60 font-mono text-xs">#{contact.contactNumber}</span>
													<h3 class="text-[#47ccfc] font-mono font-bold text-sm md:text-base">{contact.name}</h3>
												</div>
												<span class="{getStatusColor(contact.status)} font-mono text-xs uppercase">{contact.status}</span>
											</div>
											<p class="text-[#47ccfc]/80 font-mono text-xs md:text-sm mb-2">{contact.email}</p>
											<p class="text-[#47ccfc]/60 font-mono text-xs line-clamp-2">{contact.message}</p>
											<p class="text-[#47ccfc]/40 font-mono text-xs mt-2">
												{new Date(contact.date).toLocaleDateString()} {new Date(contact.date).toLocaleTimeString()}
											</p>
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<div class="border-2 border-dashed border-[#47ccfc]/30 p-4 md:p-6">
							{#if selectedContact}
								<div class="flex items-start justify-between mb-4">
									<div class="flex items-center gap-2">
										<span class="text-[#47ccfc]/60 font-mono text-sm">#{selectedContact.contactNumber}</span>
										<h2 class="text-xl font-bold text-[#47ccfc] font-mono">Details</h2>
									</div>
									<button
										on:click={closeDetail}
										class="text-[#47ccfc] hover:text-white font-mono text-sm"
									>
										✕
									</button>
								</div>

								<div class="mb-6">
									<div class="mb-4">
										<p class="text-[#47ccfc]/60 font-mono text-xs mb-1">Name</p>
										<p class="text-[#47ccfc] font-mono text-sm md:text-base">{selectedContact.name}</p>
									</div>
									<div class="mb-4">
										<p class="text-[#47ccfc]/60 font-mono text-xs mb-1">Email</p>
										<a href="mailto:{selectedContact.email}" class="text-[#47ccfc] hover:text-white font-mono text-sm md:text-base underline">
											{selectedContact.email}
										</a>
									</div>
									<div class="mb-4">
										<p class="text-[#47ccfc]/60 font-mono text-xs mb-1">Date</p>
										<p class="text-[#47ccfc] font-mono text-sm">
											{new Date(selectedContact.date).toLocaleDateString()} {new Date(selectedContact.date).toLocaleTimeString()}
										</p>
									</div>
									<div class="mb-4">
										<p class="text-[#47ccfc]/60 font-mono text-xs mb-1">Status</p>
										<select
											value={selectedContact.status}
											on:change={(e) => selectedContact && updateContactStatus(selectedContact.id, e.currentTarget.value as any)}
											class="bg-transparent border-2 border-[#47ccfc]/30 p-2 text-[#47ccfc] font-mono text-sm focus:outline-none focus:border-[#47ccfc]"
										>
											<option value="new">New</option>
											<option value="replied">Replied</option>
											<option value="closed">Closed</option>
										</select>
									</div>
								</div>

								<div class="border-2 border-dashed border-[#47ccfc]/30 p-4 mb-4">
									<p class="text-[#47ccfc]/60 font-mono text-xs mb-2">Original Message</p>
									<div class="text-[#47ccfc] font-mono text-sm prose-sm prose-invert max-w-none">
										{@html formatMessage(selectedContact.message)}
									</div>
								</div>

								{#if selectedContact.replies.length > 0}
									<div class="mb-4 max-h-[300px] overflow-y-auto space-y-3">
										{#each selectedContact.replies as reply}
											<div class="border-2 border-dashed border-{reply.direction === 'sent' ? 'blue' : 'green'}-500/30 p-4">
												<div class="flex items-center justify-between mb-2">
													<p class="text-{reply.direction === 'sent' ? 'blue' : 'green'}-500 font-mono text-xs uppercase">
														{reply.direction === 'sent' ? 'You' : reply.from}
													</p>
													<p class="text-[#47ccfc]/40 font-mono text-xs">
														{new Date(reply.date).toLocaleDateString()} {new Date(reply.date).toLocaleTimeString()}
													</p>
												</div>
												<div class="text-[#47ccfc] font-mono text-sm prose-sm prose-invert max-w-none">
													{@html formatMessage(reply.message)}
												</div>
											</div>
										{/each}
									</div>
								{/if}

								<form on:submit={handleContactReply} class="space-y-4">
									{#if errorMessage}
										<div class="p-3 border-2 border-dashed border-red-500 text-red-500 font-mono text-xs">
											{errorMessage}
										</div>
									{/if}
									<div>
										<label for="reply" class="block text-[#47ccfc] mb-2 font-mono text-sm">
											Reply (Markdown supported)
										</label>
										<textarea
											id="reply"
											bind:value={replyMessage}
											rows="6"
											required
											placeholder="Type your reply... (supports # headers, **bold**, *italic*, `code`, [links](url))"
											class="w-full bg-transparent border-2 border-[#47ccfc]/30 p-3 text-[#47ccfc] font-mono text-sm focus:outline-none focus:border-[#47ccfc] resize-none"
										></textarea>
										{#if replyMessage}
											<div class="mt-2 p-3 border-2 border-dashed border-[#47ccfc]/30">
												<p class="text-[#47ccfc]/60 font-mono text-xs mb-2">Preview:</p>
												<div class="text-[#47ccfc] font-mono text-sm prose-sm prose-invert max-w-none">
													{@html formatMessage(replyMessage)}
												</div>
											</div>
										{/if}
									</div>
									<button
										type="submit"
										class="w-full bg-[#47ccfc] text-[#2b2b2b] p-3 font-bold font-mono text-sm hover:bg-[#47ccfc]/90 transition-colors"
									>
										SEND REPLY
									</button>
								</form>
							{:else}
								<div class="flex items-center justify-center h-full">
									<p class="text-[#47ccfc]/60 font-mono text-sm">Select a contact to view details</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
