<script lang="ts">
	import { slide } from 'svelte/transition';
	import { ChartNoAxesCombined } from '@lucide/svelte';

	interface SubJob {
		id: number;
		job_name: string;
		status: string;
		sub_job_id: string;
		created_at: string;
		updated_at: string;
		metadata?: any;
	}

	let {
		subJobs,
		isRunningResearch,
		showFlows = $bindable(true),
		onFlowSelect
	}: {
		subJobs: SubJob[];
		isRunningResearch: boolean;
		showFlows: boolean;
		onFlowSelect: (subJob: SubJob) => void;
	} = $props();
</script>

{#if subJobs.length > 0}
	<div class="mb-4 md:mb-8 border border-base-300 rounded-lg overflow-hidden">
		<!-- Header with toggle -->
		<button
			class="w-full p-2 md:p-4 bg-base-200 hover:bg-base-300 transition-colors flex items-center justify-between"
			on:click={() => (showFlows = !showFlows)}
		>
			<div class="flex items-center gap-2 md:gap-3">
				<ChartNoAxesCombined class="w-4 h-4 md:w-5 md:h-5 text-primary" />
				<span class="text-sm md:text-base font-semibold text-base-content">Research Flows</span>
				<span class="badge badge-primary badge-sm md:badge-md">{subJobs.length} flows</span>
				{#if !isRunningResearch}
					<span class="badge badge-success">Completed</span>
				{/if}
			</div>
			<svg
				class="w-5 h-5 transition-transform {showFlows ? 'rotate-180' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		<!-- Collapsible content -->
		{#if showFlows}
			<div class="p-2 md:p-4" transition:slide>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 md:gap-2">
					{#each subJobs as subJob (subJob.sub_job_id)}
						<button
							class="p-2 md:p-3 rounded-lg border text-left transition-all hover:shadow-md {subJob.status ===
							'completed'
								? 'bg-success/10 border-success/30 hover:bg-success/20'
								: subJob.status === 'running'
									? 'bg-primary/10 border-primary/30 hover:bg-primary/20'
									: subJob.status === 'failed'
										? 'bg-error/10 border-error/30 hover:bg-error/20'
										: 'bg-base-200 border-base-300 hover:bg-base-300'}"
							on:click={() => onFlowSelect(subJob)}
						>
							<div class="flex items-center gap-2">
								{#if subJob.status === 'completed'}
									<div class="w-2 h-2 rounded-full bg-success"></div>
								{:else if subJob.status === 'running'}
									<div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
								{:else if subJob.status === 'failed'}
									<div class="w-2 h-2 rounded-full bg-error"></div>
								{:else}
									<div class="w-2 h-2 rounded-full bg-base-300"></div>
								{/if}
								<span class="text-xs font-medium truncate">{subJob.job_name}</span>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}
