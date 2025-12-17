<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let targetSelector = 'a, button, [role="button"], .clickable';
	export let spinDuration = 2;
	export let hideDefaultCursor = true;

	let cursorWrapper: HTMLDivElement;
	let dot: HTMLDivElement;
	let corners: HTMLDivElement[] = [];
	let isSpinning = true;
	let activeTarget: Element | null = null;

	onMount(() => {
		if (!browser) return;

		// Hide default cursor
		if (hideDefaultCursor) {
			document.body.style.cursor = 'none';
		}

		let mouseX = window.innerWidth / 2;
		let mouseY = window.innerHeight / 2;

		// Set initial position
		cursorWrapper.style.left = mouseX + 'px';
		cursorWrapper.style.top = mouseY + 'px';

		// Mouse move handler
		const handleMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
			
			// Always move cursor wrapper to follow mouse
			cursorWrapper.style.left = mouseX + 'px';
			cursorWrapper.style.top = mouseY + 'px';
			
			// If we have an active target, update corner positions
			if (activeTarget) {
				updateCornersForTarget(activeTarget);
			}
		};

		// Mouse enter handler for targets
		const handleMouseEnter = (e: MouseEvent) => {
			const target = (e.target as Element).closest(targetSelector);
			if (!target || activeTarget === target) return;

			activeTarget = target;
			isSpinning = false;
			rotation = 0; // Instantly reset rotation
			cursorWrapper.style.transform = 'translate(-50%, -50%) rotate(0deg) scale(1)';
			
			lockOntoTarget(target);
		};

		// Mouse leave handler for targets
		const handleMouseLeave = (e: MouseEvent) => {
			const target = (e.target as Element).closest(targetSelector);
			if (!target || target !== activeTarget) return;

			activeTarget = null;
			isSpinning = true;
			cursorWrapper.style.transform = 'translate(-50%, -50%) scale(1)';
			resetCorners();
		};

		// Lock cursor onto target
		const lockOntoTarget = (target: Element) => {
			updateCornersForTarget(target);
		};

		// Update corner positions relative to target
		const updateCornersForTarget = (target: Element) => {
			const rect = target.getBoundingClientRect();
			const cursorCenterX = mouseX;
			const cursorCenterY = mouseY;

			// Position corners around target
			const borderOffset = 3;
			const cornerSize = 12;

			corners[0].style.transform = `translate(${rect.left - cursorCenterX - borderOffset}px, ${rect.top - cursorCenterY - borderOffset}px)`;
			corners[1].style.transform = `translate(${rect.right - cursorCenterX + borderOffset - cornerSize}px, ${rect.top - cursorCenterY - borderOffset}px)`;
			corners[2].style.transform = `translate(${rect.right - cursorCenterX + borderOffset - cornerSize}px, ${rect.bottom - cursorCenterY + borderOffset - cornerSize}px)`;
			corners[3].style.transform = `translate(${rect.left - cursorCenterX - borderOffset}px, ${rect.bottom - cursorCenterY + borderOffset - cornerSize}px)`;
		};

		// Reset corners to default position
		const resetCorners = () => {
			const cornerSize = 12;
			corners[0].style.transform = `translate(${-cornerSize * 1.5}px, ${-cornerSize * 1.5}px)`;
			corners[1].style.transform = `translate(${cornerSize * 0.5}px, ${-cornerSize * 1.5}px)`;
			corners[2].style.transform = `translate(${cornerSize * 0.5}px, ${cornerSize * 0.5}px)`;
			corners[3].style.transform = `translate(${-cornerSize * 1.5}px, ${cornerSize * 0.5}px)`;
		};

		// Add event listeners
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseover', handleMouseEnter);
		document.addEventListener('mouseout', handleMouseLeave);

		// Spinning animation
		let spinAnimation: number;
		let rotation = 0;
		const spin = () => {
			if (isSpinning) {
				rotation += 360 / (spinDuration * 60); // 60fps
				cursorWrapper.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
			}
			spinAnimation = requestAnimationFrame(spin);
		};
		spin();

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseover', handleMouseEnter);
			document.removeEventListener('mouseout', handleMouseLeave);
			cancelAnimationFrame(spinAnimation);
			if (hideDefaultCursor) {
				document.body.style.cursor = '';
			}
		};
	});
</script>

<div 
	bind:this={cursorWrapper}
	class="target-cursor-wrapper"
>
	<div bind:this={dot} class="target-cursor-dot"></div>
	<div bind:this={corners[0]} class="target-cursor-corner corner-tl"></div>
	<div bind:this={corners[1]} class="target-cursor-corner corner-tr"></div>
	<div bind:this={corners[2]} class="target-cursor-corner corner-br"></div>
	<div bind:this={corners[3]} class="target-cursor-corner corner-bl"></div>
</div>

<style>
	.target-cursor-wrapper {
		position: fixed;
		top: 0;
		left: 0;
		width: 0;
		height: 0;
		pointer-events: none;
		z-index: 9999;
		transform: translate(-50%, -50%);
		transition: transform 0.3s ease-out;
	}

	.target-cursor-dot {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 4px;
		height: 4px;
		background: #47ccfc;
		border-radius: 50%;
		transform: translate(-50%, -50%);
	}

	.target-cursor-corner {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 12px;
		height: 12px;
		border: 3px solid #47ccfc;
		transition: transform 0.3s ease-out;
	}

	.corner-tl {
		transform: translate(-150%, -150%);
		border-right: none;
		border-bottom: none;
	}

	.corner-tr {
		transform: translate(50%, -150%);
		border-left: none;
		border-bottom: none;
	}

	.corner-br {
		transform: translate(50%, 50%);
		border-left: none;
		border-top: none;
	}

	.corner-bl {
		transform: translate(-150%, 50%);
		border-right: none;
		border-top: none;
	}

	@media only screen and (max-width: 600px) {
		.target-cursor-wrapper,
		.target-cursor-dot,
		.target-cursor-corner {
			display: none;
		}
	}
</style>