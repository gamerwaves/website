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
		scroll-margin-top: 2rem;
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
			<article class="prose prose-invert prose-cyan max-w-none" bind:this={articleElement}>
				{@html data.post.htmlContent}
			</article>
		</div>
	</div>
</div>

<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;

	let copiedHeaderId: string | null = null;
	let articleElement: HTMLElement;

	function generateHeaderId(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	function copyHeaderLink(headerId: string) {
		const url = `${window.location.origin}${window.location.pathname}#${headerId}`;
		navigator.clipboard.writeText(url);
		copiedHeaderId = headerId;
		setTimeout(() => {
			copiedHeaderId = null;
		}, 2000);
	}

	onMount(() => {
		if (!articleElement) return;

		// Process all headers and add IDs and link buttons
		const headers = articleElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
		headers.forEach((header) => {
			const text = header.textContent || '';
			const id = generateHeaderId(text);
			header.id = id;

			// Create link button
			const linkBtn = document.createElement('button');
			linkBtn.className = 'header-link-btn';
			linkBtn.type = 'button';
			linkBtn.title = 'Copy link to this section';
			linkBtn.style.cssText = `
				display: inline-flex;
				align-items: center;
				gap: 0.5rem;
				margin-left: 0.5rem;
				opacity: 0;
				transition: opacity 0.2s;
				background: none;
				border: none;
				cursor: pointer;
				padding: 0;
			`;
			linkBtn.innerHTML = `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="link" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="1rem" height="1rem" style="cursor: pointer; transition: transform 0.2s;"><g><path d="M16.693,16.664c0.376,-0.375 1.001,-0.413 1.377,-0.038l0.083,0.084c0.358,0.357 0.386,0.93 0.032,1.291c-0.026,0.026 -0.051,0.052 -0.077,0.078c-0.867,0.866 -1.671,1.438 -2.514,1.655c0,0 -0.001,0 -0.001,0c-0.078,0.02 -0.157,0.037 -0.236,0.051c0,0 0,0 0,0c-0.802,0.142 -1.646,-0.036 -2.616,-0.582l0,0c-0.907,-0.511 -1.923,-1.343 -3.119,-2.539c-3.959,-3.959 -3.939,-5.959 -1.414,-8.485c2.526,-2.525 4.526,-2.545 8.485,1.414c0.439,0.439 0.828,0.853 1.171,1.247c0.102,0.117 -0.009,0.3 -0.162,0.28c0,0 0,0 -0.001,0c-0.559,-0.074 -1.083,-0.035 -1.58,0.094c-0.299,0.078 -0.624,0.012 -0.842,-0.206c-1.958,-1.958 -3.035,-2.492 -3.63,-2.571c-0.366,-0.049 -0.902,0.032 -2.027,1.156c-1.124,1.125 -1.205,1.661 -1.156,2.027c0.079,0.595 0.613,1.672 2.571,3.63c0.432,0.433 0.822,0.796 1.173,1.1c0,0 0,0 0,0c0.046,0.04 0.091,0.079 0.136,0.117c0,0 0,0 0,0c0.841,0.712 1.45,1.073 1.891,1.24c0,0 0,0 0,0c0.166,0.062 0.308,0.098 0.429,0.114c0,0 0,0 0,0c0.367,0.049 0.903,-0.032 2.027,-1.157Zm3.07,-1.099c-0.912,-0.79 -1.563,-1.181 -2.027,-1.357c0,0 0,0 0,0c-0.166,-0.063 -0.308,-0.098 -0.43,-0.114c0,0 0,0 0,0c-0.367,-0.049 -0.902,0.032 -2.027,1.156c-0.375,0.376 -1.001,0.414 -1.376,0.038l-0.083,-0.083c-0.358,-0.358 -0.387,-0.931 -0.032,-1.291c0.025,-0.026 0.051,-0.052 0.077,-0.078c0.866,-0.866 1.671,-1.438 2.514,-1.655l0,0c0.873,-0.225 1.786,-0.07 2.853,0.531c0,0 0,0 0,0c0.906,0.51 1.923,1.343 3.118,2.538c3.96,3.96 3.94,5.96 1.414,8.486c-2.525,2.525 -4.525,2.545 -8.485,-1.415c-0.438,-0.438 -0.828,-0.852 -1.171,-1.246c-0.102,-0.117 0.009,-0.301 0.163,-0.28c0.559,0.074 1.083,0.035 1.581,-0.094c0.299,-0.078 0.623,-0.012 0.841,0.206c1.958,1.958 3.035,2.492 3.63,2.571c0.367,0.049 0.903,-0.032 2.027,-1.157c1.125,-1.124 1.206,-1.66 1.157,-2.027c-0.079,-0.595 -0.613,-1.672 -2.571,-3.63c-0.433,-0.432 -0.822,-0.795 -1.173,-1.099Z"></path></g></svg>`;
			
			linkBtn.onmouseenter = () => linkBtn.style.opacity = '1';
			linkBtn.onmouseleave = () => linkBtn.style.opacity = '0';
			linkBtn.onclick = (e) => {
				e.preventDefault();
				copyHeaderLink(id);
			};

			header.appendChild(linkBtn);
		});
	});
</script>
