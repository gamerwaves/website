<script lang="ts">
	import '../app.css';
	import TargetCursor from '$lib/TargetCursor.svelte';
</script>

<div class="min-h-screen bg-[#2b2b2b] grid-bg">
	<slot />
</div>

<TargetCursor />
