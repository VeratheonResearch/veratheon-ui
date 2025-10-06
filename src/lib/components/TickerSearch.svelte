<!-- TickerSearch.svelte - A reusable ticker search component -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { debounce } from 'lodash-es';

	export let placeholder = 'Search for a stock...';
	export let minLength = 2;
	export let debounceTime = 300;

	interface TickerResult {
		'1. symbol': string;
		'2. name': string;
		'3. type': string;
		'4. region': string;
		'8. currency': string;
	}

	let query = '';
	let results: TickerResult[] = [];
	let loading = false;
	let error: string | null = null;
	let focused = false;

	const dispatch = createEventDispatcher();

	// Debounced search function
	const debouncedSearch = debounce(async (searchQuery: string) => {
		if (searchQuery.length < minLength) {
			results = [];
			loading = false;
			return;
		}

		loading = true;
		error = null;

		try {
			const response = await fetch(`/api/ticker-search?query=${encodeURIComponent(searchQuery)}`);

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const data = await response.json();
			results = data.bestMatches || [];
		} catch (err) {
			console.error('Search error:', err);
			error = 'Failed to fetch results';
			results = [];
		} finally {
			loading = false;
		}
	}, debounceTime);

	// Handle input changes
	function handleInput() {
		debouncedSearch(query);
	}

	// Handle selection of a ticker
	function selectTicker(ticker: TickerResult) {
		query = ticker['1. symbol'];
		dispatch('select', {
			symbol: ticker['1. symbol'],
			name: ticker['2. name'],
			type: ticker['3. type'],
			region: ticker['4. region'],
			currency: ticker['8. currency']
		});
		results = [];
	}

	// Handle focus events
	function handleFocus() {
		focused = true;
		if (query.length >= minLength) {
			debouncedSearch(query);
		}
	}

	function handleBlur() {
		// Delay hiding results to allow for click events
		setTimeout(() => {
			focused = false;
		}, 200);
	}
</script>

<div class="ticker-search relative w-full">
	<input
		type="text"
		bind:value={query}
		oninput={handleInput}
		onfocus={handleFocus}
		onblur={handleBlur}
		{placeholder}
		class="input-bordered input w-full"
		autocomplete="off"
	/>

	{#if loading}
		<div class="absolute top-3 right-3">
			<div class="loading loading-xs loading-spinner"></div>
		</div>
	{/if}

	{#if focused && (results.length > 0 || error)}
		<div
			class="results absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-base-300 bg-base-100 shadow-lg"
		>
			{#if error}
				<div class="p-3 text-error">{error}</div>
			{:else}
				{#each results as ticker (ticker['1. symbol'])}
					<button
						class="flex w-full flex-col px-3 py-2 text-left hover:bg-base-200"
						onclick={() => selectTicker(ticker)}
					>
						<div class="flex justify-between">
							<span class="font-bold">{ticker['1. symbol']}</span>
							<span class="text-sm opacity-70">{ticker['4. region']}</span>
						</div>
						<div class="truncate text-sm">{ticker['2. name']}</div>
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.results {
		max-height: 300px;
	}
</style>
