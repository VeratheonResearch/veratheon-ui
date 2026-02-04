<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { ArrowUp } from '@lucide/svelte';

	let {
		threshold = 300,
		targetId
	}: {
		threshold?: number;
		targetId?: string;
	} = $props();

	let isVisible = $state(false);
	let scrollContainer: Element | Window = typeof window !== 'undefined' ? window : null!;

	function handleScroll() {
		if (scrollContainer === window) {
			isVisible = window.scrollY > threshold;
		} else if (scrollContainer instanceof Element) {
			isVisible = scrollContainer.scrollTop > threshold;
		}
	}

	function scrollToTop() {
		if (targetId) {
			const element = document.getElementById(targetId);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				return;
			}
		}

		if (scrollContainer === window) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} else if (scrollContainer instanceof Element) {
			scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			scrollContainer = window;
			window.addEventListener('scroll', handleScroll, { passive: true });
			// Check initial position
			handleScroll();
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('scroll', handleScroll);
		}
	});
</script>

{#if isVisible}
	<button
		class="fixed bottom-6 right-6 z-50 btn btn-circle btn-primary shadow-lg hover:shadow-xl transition-shadow"
		onclick={scrollToTop}
		aria-label="Scroll to top"
		transition:fade={{ duration: 200 }}
	>
		<ArrowUp class="w-5 h-5" />
	</button>
{/if}
