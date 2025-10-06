<script lang="ts">
	import { Search } from '@lucide/svelte';
	import ReportStatusIndicator from '$lib/components/ReportStatusIndicator.svelte';
	import TickerSearch from '$lib/components/TickerSearch.svelte';

	let {
		stockSymbol = $bindable(''),
		forceRecompute = $bindable(false),
		isRunningResearch,
		onStartResearch
	}: {
		stockSymbol: string;
		forceRecompute: boolean;
		isRunningResearch: boolean;
		onStartResearch: () => void;
	} = $props();
</script>

<div class="card bg-base-100 shadow-lg border border-base-200">
	<div class="card-body p-3 md:p-6">
		<h2 class="card-title text-base md:text-xl font-bold text-primary mb-2 md:mb-4">Consensus EPS Validation</h2>

		<div class="flex flex-col gap-3">
			<!-- Stock Symbol Input with Ticker Search -->
			<div class="form-control w-full">
				<label for="stock-symbol" class="label pb-1">
					<span class="label-text text-sm md:text-base font-medium text-base-content">Stock Symbol or Company Name</span>
				</label>
				<div class="flex items-center gap-2">
					<div class="flex-1">
						<TickerSearch
							placeholder="Search for a stock..."
							on:select={(e) => {
								stockSymbol = e.detail.symbol;
							}}
						/>
					</div>
					{#if stockSymbol.trim()}
						<ReportStatusIndicator symbol={stockSymbol} />
					{/if}
				</div>
			</div>

			<!-- Recompute and Button Group -->
			<div class="flex flex-col md:flex-row items-stretch md:items-center gap-2">
				<!-- Recompute Checkbox -->
				<div class="flex items-center justify-center gap-2 order-2 md:order-1">
					<label for="force-recompute" class="text-xs md:text-sm text-base-content/70">Recompute</label>
					<input
						id="force-recompute"
						type="checkbox"
						class="checkbox checkbox-primary checkbox-sm md:checkbox-md"
						bind:checked={forceRecompute}
						disabled={isRunningResearch}
					/>
				</div>

				<!-- Start Research Button -->
				<button
					class="btn btn-primary btn-sm md:btn-md shadow-md w-full md:w-auto order-1 md:order-2"
					class:btn-disabled={isRunningResearch || !stockSymbol.trim()}
					on:click={onStartResearch}
					disabled={isRunningResearch || !stockSymbol.trim()}
				>
					{#if isRunningResearch}
						<span class="loading loading-spinner loading-sm"></span>
						Analyzing...
					{:else}
						<Search class="w-5 h-5" />
						Start Research
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>
