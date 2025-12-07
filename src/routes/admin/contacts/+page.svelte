<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { Contact } from '$lib/server/email';

	export let data: PageData;
	export let form: ActionData;

	let selectedContact: Contact | null = null;
	let replyMessage = '';
	let filterStatus: 'all' | 'new' | 'replied' | 'closed' = 'all';
	let errorMessage = '';
	let syncMessage = '';
	let isSyncing = false;
	let isCleaning = false;

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
	
	$: if (form?.error) {
		errorMessage = form.error;
		setTimeout(() => errorMessage = '', 5000);
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

	$: filteredContacts = filterStatus === 'all' 
		? data.contacts 
		: data.contacts.filter(c => c.status === filterStatus);

	function selectContact(contact: Contact) {
		selectedContact = contact;
		replyMessage = '';
	}

	function closeDetail() {
		selectedContact = null;
		replyMessage = '';
	}

	async function handleReply(e: Event) {
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

	async function updateStatus(contactId: string, status: 'new' | 'replied' | 'closed') {
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
</script>

<div class="min-h-screen p-4 md:p-8">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="border-2 border-dashed border-[#47ccfc]/30 p-6 md:p-8 mb-4">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-[#47ccfc] font-mono">Contacts</h1>
				<div class="flex items-center gap-2 md:gap-4 flex-wrap">
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
					<a href="/admin" class="text-[#47ccfc] hover:text-white transition-colors font-mono text-sm md:text-base whitespace-nowrap">← Back</a>
				</div>
			</div>
			{#if syncMessage}
				<div class="mt-4 p-3 border-2 border-dashed border-[#47ccfc]/30 text-[#47ccfc] font-mono text-xs">
					{syncMessage}
				</div>
			{/if}
		</div>

		<!-- Filter -->
		<div class="border-2 border-dashed border-[#47ccfc]/30 p-4 md:p-6 mb-4">
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
					New ({data.contacts.filter(c => c.status === 'new').length})
				</button>
				<button
					on:click={() => filterStatus = 'replied'}
					class="px-4 py-2 font-mono text-sm {filterStatus === 'replied' ? 'bg-[#47ccfc] text-[#2b2b2b]' : 'border-2 border-[#47ccfc]/30 text-[#47ccfc]'} hover:bg-[#47ccfc]/90 transition-colors"
				>
					Replied ({data.contacts.filter(c => c.status === 'replied').length})
				</button>
				<button
					on:click={() => filterStatus = 'closed'}
					class="px-4 py-2 font-mono text-sm {filterStatus === 'closed' ? 'bg-[#47ccfc] text-[#2b2b2b]' : 'border-2 border-[#47ccfc]/30 text-[#47ccfc]'} hover:bg-[#47ccfc]/90 transition-colors"
				>
					Closed ({data.contacts.filter(c => c.status === 'closed').length})
				</button>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<!-- Contacts List -->
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

			<!-- Contact Detail -->
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

					<!-- Contact Info -->
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
								on:change={(e) => selectedContact && updateStatus(selectedContact.id, e.currentTarget.value as any)}
								class="bg-transparent border-2 border-[#47ccfc]/30 p-2 text-[#47ccfc] font-mono text-sm focus:outline-none focus:border-[#47ccfc]"
							>
								<option value="new">New</option>
								<option value="replied">Replied</option>
								<option value="closed">Closed</option>
							</select>
						</div>
					</div>

					<!-- Original Message -->
					<div class="border-2 border-dashed border-[#47ccfc]/30 p-4 mb-4">
						<p class="text-[#47ccfc]/60 font-mono text-xs mb-2">Original Message</p>
						<div class="text-[#47ccfc] font-mono text-sm prose-sm prose-invert max-w-none">
							{@html formatMessage(selectedContact.message)}
						</div>
					</div>

					<!-- Conversation Thread -->
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

					<!-- Reply Form -->
					<form on:submit={handleReply} class="space-y-4">
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
								rows="8"
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
</div>
