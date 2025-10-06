<script lang="ts">
	import { page } from '$app/stores';
	import { Home, TrendingUp, Clock } from '@lucide/svelte';
	import GitHubLink from '$lib/components/GitHubLink.svelte';

	let { isOpen, onToggle }: { isOpen: boolean; onToggle: () => void } = $props();

	// Close mobile menu when clicking outside
	const handleClickOutside = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (isOpen && !target.closest('.mobile-menu-container')) {
			onToggle();
		}
	};

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<div class="md:hidden relative mobile-menu-container">
	<button
		class="p-2 rounded-full hover:bg-base-200"
		aria-label="Open menu"
		onclick={onToggle}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h8m-8 6h16"
			/>
		</svg>
	</button>
	{#if isOpen}
		<div class="absolute right-0 mt-2 w-56 bg-base-100 rounded-md shadow-lg py-2 z-10 border border-base-300">
			<a
				href="/"
				class="flex items-center gap-3 px-4 py-2 hover:bg-base-200 {$page.url.pathname === '/' ? 'bg-base-200 font-semibold' : ''}"
			>
				<Home class="w-4 h-4" />
				<span>Home</span>
				{#if $page.url.pathname === '/'}
					<div class="ml-auto w-1 h-4 bg-primary rounded-full"></div>
				{/if}
			</a>
			<a
				href="/trades"
				class="flex items-center gap-3 px-4 py-2 hover:bg-base-200 {$page.url.pathname === '/trades' ? 'bg-base-200 font-semibold' : ''}"
			>
				<TrendingUp class="w-4 h-4" />
				<span>Trades</span>
				{#if $page.url.pathname === '/trades'}
					<div class="ml-auto w-1 h-4 bg-primary rounded-full"></div>
				{/if}
			</a>
			<a
				href="/history"
				class="flex items-center gap-3 px-4 py-2 hover:bg-base-200 {$page.url.pathname === '/history' ? 'bg-base-200 font-semibold' : ''}"
			>
				<Clock class="w-4 h-4" />
				<span>History</span>
				{#if $page.url.pathname === '/history'}
					<div class="ml-auto w-1 h-4 bg-primary rounded-full"></div>
				{/if}
			</a>
			<div class="border-t border-base-300 my-2"></div>
			<GitHubLink isMobile={true} />
			<a
				href="/settings"
				class="flex items-center gap-3 px-4 py-2 hover:bg-base-200 {$page.url.pathname === '/settings' ? 'bg-base-200 font-semibold' : ''}"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
				<span>Settings</span>
				{#if $page.url.pathname === '/settings'}
					<div class="ml-auto w-1 h-4 bg-primary rounded-full"></div>
				{/if}
			</a>
		</div>
	{/if}
</div>
