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
	<div class="card-body p-6">
		<h2 class="card-title text-xl font-bold text-primary mb-4">Consensus EPS Validation</h2>

		<div class="flex flex-wrap gap-6 items-end">
			<!-- Stock Symbol Input with Ticker Search -->
			<div class="form-control w-80">
				<label for="stock-symbol" class="label pb-2">
					<span class="label-text font-medium text-base-content">Stock Symbol or Company Name</span>
				</label>
				<div class="flex items-center gap-2">
					<div class="w-full">
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

			<!-- Spacer -->
			<div class="flex-1"></div>

			<!-- Recompute and Button Group -->
			<div class="flex items-center gap-3">
				<!-- Recompute Checkbox -->
				<div class="flex items-center gap-2">
					<label for="force-recompute" class="text-sm text-base-content/70">Recompute</label>
					<input
						id="force-recompute"
						type="checkbox"
						class="checkbox checkbox-primary checkbox-lg"
						bind:checked={forceRecompute}
						disabled={isRunningResearch}
					/>
				</div>

				<!-- Start Research Button -->
				<button
					class="btn btn-primary btn-lg shadow-md"
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
