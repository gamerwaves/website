<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="min-h-screen p-4 md:p-8">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="border-2 border-dashed border-[#47ccfc]/30 p-6 md:p-8 mb-4">
			<div class="flex items-center justify-between mb-4 gap-4">
				<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-[#47ccfc] font-mono">Blog</h1>
				<a href="/" class="text-[#47ccfc] hover:text-white transition-colors font-mono text-sm md:text-base whitespace-nowrap">← Home</a>
			</div>
			<p class="text-[#47ccfc]/80 font-mono text-sm md:text-base">Thoughts, tutorials, and updates</p>
		</div>

		<!-- Blog Posts -->
		{#if data.posts.length === 0}
			<div class="border-2 border-dashed border-[#47ccfc]/30 p-8 md:p-12 text-center">
				<p class="text-[#47ccfc]/60 font-mono text-sm md:text-base">No posts yet. Check back soon!</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each data.posts as post}
					<a
						href="/blog/{post.slug}"
						class="block border-2 border-dashed border-[#47ccfc]/30 p-6 md:p-8 hover:bg-[#47ccfc]/10 transition-colors"
					>
						<div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4 mb-3">
							<h2 class="text-xl md:text-2xl font-bold text-[#47ccfc] font-mono">{post.title}</h2>
							<span class="text-[#47ccfc]/60 font-mono text-xs md:text-sm whitespace-nowrap"
								>{new Date(post.date).toLocaleDateString()}</span
							>
						</div>
						<p class="text-[#47ccfc]/80 font-mono text-sm md:text-base leading-relaxed">{post.preview}</p>
						<div class="mt-4 text-[#47ccfc] font-mono text-sm md:text-base">Read more →</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
