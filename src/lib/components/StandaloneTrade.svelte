<script lang="ts">
	import TradeButton from './TradeButton.svelte';
	import TradeModal from './TradeModal.svelte';
	import TradeHistory from './TradeHistory.svelte';
	import type { Trade, TradeDetails } from '$lib/research-types';
	import { DollarSign, Search } from '@lucide/svelte';

	// Component state
	let symbol: string = '';
	let companyName: string = '';
	let isTradeModalOpen = false;
	let trades: Trade[] = [];
	let isLoading = false;
	let error: string | null = null;
	let isSearching = false;

	// Handle trade submission
	async function handleTradeSubmit(tradeDetails: TradeDetails) {
		isLoading = true;
		error = null;

		try {
			// Create a unique ID for the trade
			const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

			// In a real implementation, this would be sent to the backend for validation
			// For now, we'll create a mock trade with pending status
			const newTrade: Trade = {
				...tradeDetails,
				id: tradeId,
				timestamp: new Date().toISOString(),
				status: 'pending'
			};

			// Add the new trade to the list
			trades = [newTrade, ...trades];

			// In the future, this would trigger validation against the research data
			console.log('Trade submitted for validation:', newTrade);
		} catch (err) {
			error = 'An error occurred while submitting the trade';
			console.error('Trade submission error:', err);
		} finally {
			isLoading = false;
		}
	}

	// Load trades for a symbol (mock implementation)
	function loadTrades(symbolToLoad: string) {
		if (!symbolToLoad) return;

		isLoading = true;
		error = null;

		try {
			// In a real implementation, this would fetch trades from the backend
			// For now, we'll use mock data
			trades = [];
		} catch (err) {
			error = 'An error occurred while fetching trades';
			console.error('Trade fetch error:', err);
		} finally {
			isLoading = false;
		}
	}

	// Search for company info
	function searchSymbol() {
		if (!symbol.trim()) return;

		isSearching = true;
		error = null;

		try {
			// In a real application, you would fetch company info from an API
			// For now, we'll just use a mock response
			setTimeout(() => {
				// Mock company name based on symbol
				companyName = `${symbol.toUpperCase()} Corporation`;

				// Load trades for the symbol
				loadTrades(symbol);

				isSearching = false;
			}, 500); // Simulate API delay
		} catch (err) {
			error = 'An error occurred while searching for the symbol';
			console.error('Symbol search error:', err);
			isSearching = false;
		}
	}

	// Handle form submission
	function handleSearchSubmit(event: Event) {
		event.preventDefault();
		searchSymbol();
	}
</script>

<div class="card border border-base-200 bg-base-100 shadow-lg">
	<div class="card-body p-6">
		<h2 class="mb-4 card-title text-xl font-bold text-primary">Quick Trade</h2>

		<!-- Symbol Search Form -->
		<form onsubmit={handleSearchSubmit} class="mb-6 flex flex-wrap items-end gap-3">
			<div class="form-control">
				<label for="quick-trade-symbol" class="label pb-2">
					<span class="label-text font-medium text-base-content">Stock Symbol</span>
				</label>
				<input
					id="quick-trade-symbol"
					type="text"
					placeholder="AAPL"
					class="input-bordered input w-24 input-primary focus:input-primary"
					bind:value={symbol}
					disabled={isSearching}
				/>
			</div>

			<button type="submit" class="btn btn-primary" disabled={isSearching || !symbol.trim()}>
				{#if isSearching}
					<span class="loading loading-sm loading-spinner"></span>
					Searching...
				{:else}
					<Search class="h-4 w-4" />
					Search
				{/if}
			</button>
		</form>

		<!-- Trade Actions -->
		{#if companyName}
			<div class="mb-6">
				<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
					<div>
						<h3 class="text-lg font-semibold">{symbol.toUpperCase()}</h3>
						<p class="text-base-content/70">{companyName}</p>
					</div>
					<div>
						<TradeButton
							{symbol}
							{companyName}
							variant="primary"
							size="md"
							onclick={() => (isTradeModalOpen = true)}
						>
							Create Trade
						</TradeButton>
					</div>
				</div>
			</div>

			<!-- Trade History -->
			{#if isLoading}
				<div class="flex items-center justify-center py-8">
					<div class="flex flex-col items-center">
						<div class="loading mb-4 loading-lg loading-spinner text-primary"></div>
						<p class="text-base-content/70">Loading trades...</p>
					</div>
				</div>
			{:else if error}
				<div class="alert alert-error">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{error}</span>
				</div>
			{:else}
				<TradeHistory {trades} />
			{/if}
		{:else}
			<div class="flex flex-col items-center justify-center py-8 text-base-content/60">
				<div class="mb-4 text-4xl">
					<DollarSign class="h-12 w-12 opacity-40" />
				</div>
				<p class="mb-1 text-lg font-medium">Enter a stock symbol</p>
				<p class="text-sm">Search for a stock to start trading</p>
			</div>
		{/if}
	</div>
</div>

<!-- Trade Modal -->
<TradeModal
	isOpen={isTradeModalOpen}
	{symbol}
	{companyName}
	onclose={() => (isTradeModalOpen = false)}
	onsubmit={handleTradeSubmit}
/>
