<style>
	:global(.prose) {
		color: rgba(71, 204, 252, 0.9);
		font-family: 'Courier New', monospace;
	}

	:global(.prose h1),
	:global(.prose h2),
	:global(.prose h3),
	:global(.prose h4),
	:global(.prose h5),
	:global(.prose h6) {
		color: #47ccfc;
		font-weight: bold;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	:global(.prose h1) {
		font-size: 2rem;
	}

	:global(.prose h2) {
		font-size: 1.5rem;
	}

	:global(.prose h3) {
		font-size: 1.25rem;
	}

	:global(.prose p) {
		margin-bottom: 1rem;
		line-height: 1.7;
	}

	:global(.prose a) {
		color: #47ccfc;
		text-decoration: underline;
	}

	:global(.prose a:hover) {
		color: white;
	}

	:global(.prose code) {
		background: rgba(71, 204, 252, 0.1);
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
		font-size: 0.9em;
	}

	:global(.prose pre) {
		background: rgba(71, 204, 252, 0.05);
		border: 2px dashed rgba(71, 204, 252, 0.3);
		padding: 1rem;
		overflow-x: auto;
		margin: 1rem 0;
	}

	:global(.prose pre code) {
		background: transparent;
		padding: 0;
	}

	:global(.prose ul),
	:global(.prose ol) {
		margin-left: 1.5rem;
		margin-bottom: 1rem;
	}

	:global(.prose li) {
		margin-bottom: 0.5rem;
	}

	:global(.prose blockquote) {
		border-left: 4px solid #47ccfc;
		padding-left: 1rem;
		margin: 1rem 0;
		font-style: italic;
		color: rgba(71, 204, 252, 0.7);
	}

	:global(.prose img) {
		border: 2px dashed rgba(71, 204, 252, 0.3);
		margin: 1rem 0;
	}

	:global(.prose table) {
		border: 2px dashed rgba(71, 204, 252, 0.3);
		width: 100%;
		margin: 1rem 0;
	}

	:global(.prose th),
	:global(.prose td) {
		border: 1px dashed rgba(71, 204, 252, 0.3);
		padding: 0.5rem;
	}

	:global(.prose th) {
		background: rgba(71, 204, 252, 0.1);
		font-weight: bold;
	}
</style>

<div class="min-h-screen p-4 md:p-8">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="border-2 border-dashed border-[#47ccfc]/30 p-6 md:p-8 mb-4">
			<div class="flex items-center justify-between mb-4 gap-4">
				<a href="/blog" class="text-[#47ccfc] hover:text-white transition-colors font-mono text-sm md:text-base whitespace-nowrap">← Back to Blog</a>
			</div>
			<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-[#47ccfc] font-mono mb-4">{data.post.title}</h1>
			<p class="text-[#47ccfc]/60 font-mono text-xs md:text-sm">
				{new Date(data.post.date).toLocaleDateString('en-US', { 
					year: 'numeric', 
					month: 'long', 
					day: 'numeric' 
				})}
			</p>
		</div>

		<!-- Content -->
		<div class="border-2 border-dashed border-[#47ccfc]/30 p-6 md:p-8">
			<article class="prose prose-invert prose-cyan max-w-none">
				{@html data.post.htmlContent}
			</article>
		</div>
	</div>
</div>

<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>
