<script lang="ts">
	import '../app.css';
	import TargetCursor from '$lib/TargetCursor.svelte';

	let copyrightClicks = 0;
	function handleCopyrightClick() {
		copyrightClicks++;
		if (copyrightClicks >= 5) {
			window.location.href = '/admin';
		}
	}
</script>

<svelte:head>
	<script src="https://pagering.gideon.sh/embed.js" defer></script>
</svelte:head>

<div class="min-h-screen bg-[#2b2b2b] grid-bg">
	<slot />

	<!-- Footer -->
	<div class="p-4 md:p-8">
		<div class="border-box p-6 md:p-8 text-center mb-12">
			<p class="text-[#47ccfc]/60 font-mono text-xs md:text-sm">
				<button
					on:click={handleCopyrightClick}
					class="hover:text-[#47ccfc] transition-colors cursor-default"
					type="button"
				>
					&copy;
				</button> 2025 Dwait Pandhi. Built with Svelte & Tailwind CSS
			</p>
			<br />
			<div class="flex justify-center"><pagering-link></pagering-link></div>
		</div>
	</div>
</div>

<TargetCursor />
