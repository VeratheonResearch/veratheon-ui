<script lang="ts">
	import { DollarSign, ArrowUpRight, ArrowDownRight, Calendar, HelpCircle } from '@lucide/svelte';
	import type { Trade } from '$lib/research-types';

	export let trades: Trade[] = [];
	export let showEmpty: boolean = true;

	// Format the expiration date
	function formatDate(dateString: string): string {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleDateString();
	}
</script>

<div class="card border border-base-200 bg-base-100 shadow-lg">
	<div class="card-body p-6">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="card-title text-xl font-bold text-primary">Trade History</h2>
			<div class="badge badge-lg badge-secondary">{trades.length} Trades</div>
		</div>

		{#if trades.length === 0 && showEmpty}
			<div class="flex flex-col items-center justify-center py-8 text-base-content/60">
				<div class="mb-4 text-4xl">
					<DollarSign class="h-12 w-12 opacity-40" />
				</div>
				<p class="mb-1 text-lg font-medium">No trades yet</p>
				<p class="text-sm">Your trade history will appear here</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="table w-full table-zebra">
					<thead>
						<tr>
							<th>Trade</th>
							<th>Type</th>
							<th>Details</th>
							<th>Status</th>
							<th>Date</th>
						</tr>
					</thead>
					<tbody>
						{#each trades as trade (trade.id)}
							<tr
								class="cursor-pointer hover:bg-base-200"
								title={trade.rationale || 'No rationale provided'}
							>
								<td class="font-medium">{trade.symbol}</td>
								<td>
									<div class="flex flex-col gap-1">
										{#if trade.instrumentType === 'stock'}
											<div class="flex items-center gap-1">
												{#if trade.direction === 'long'}
													<span class="flex items-center gap-1 text-success">
														<ArrowUpRight class="h-4 w-4" />
														Long
													</span>
												{:else}
													<span class="flex items-center gap-1 text-error">
														<ArrowDownRight class="h-4 w-4" />
														Short
													</span>
												{/if}
											</div>
										{:else}
											<span
												class="badge {trade.optionType === 'call'
													? 'badge-success'
													: 'badge-error'}">{trade.optionType}</span
											>
										{/if}

										{#if trade.isHedge}
											<div
												class="tooltip tooltip-bottom"
												data-tip="A hedge is a trade that reduces risk exposure from other positions in your portfolio. This trade will be evaluated as a risk management strategy rather than a directional bet."
											>
												<span class="badge flex items-center gap-1 badge-outline badge-sm">
													Hedge
													<HelpCircle class="h-3 w-3" />
												</span>
											</div>
										{/if}
									</div>
								</td>
								<td>
									{#if trade.instrumentType === 'stock'}
										Stock
									{:else if trade.instrumentType === 'option'}
										<div class="flex items-center gap-1">
											<span>${trade.strikePrice}</span>
											<span class="flex items-center gap-1 text-xs">
												<Calendar class="h-3 w-3" />
												{formatDate(trade.expirationDate)}
											</span>
										</div>
									{/if}
								</td>
								<td>
									<div
										class="badge {trade.status === 'validated'
											? 'badge-success'
											: trade.status === 'invalidated'
												? 'badge-error'
												: 'badge-warning'}"
									>
										{trade.status}
									</div>
								</td>
								<td class="text-sm text-base-content/70">
									{new Date(trade.timestamp).toLocaleDateString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
