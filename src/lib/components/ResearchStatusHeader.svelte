<script lang="ts">
	import { ChartNoAxesCombined, CircleCheckBig } from '@lucide/svelte';
	import type { ResearchResult } from '$lib/research-types';

	interface JobStep {
		step: string;
		timestamp: string;
		status: string;
	}

	interface JobStatus {
		job_id?: string;
		main_job_id?: string;
		sub_job_id?: string;
		job_name?: string;
		symbol?: string;
		status?: string;
		completed?: boolean;
		result?: ResearchResult;
		error?: string;
		steps?: JobStep[];
		created_at?: string;
		updated_at?: string;
	}

	let {
		isRunningResearch,
		researchResult,
		stockSymbol,
		currentJobId,
		jobStatus,
		onViewProcess
	}: {
		isRunningResearch: boolean;
		researchResult: ResearchResult | null;
		stockSymbol: string;
		currentJobId: string | null;
		jobStatus: JobStatus | null;
		onViewProcess: () => void;
	} = $props();
</script>

<div class="flex items-center justify-between mb-6">
	<div class="flex items-center gap-4">
		<div class="text-primary text-3xl">
			{#if isRunningResearch}
				<span class="loading loading-spinner loading-lg text-primary"></span>
			{:else if researchResult}
				<ChartNoAxesCombined class="w-8 h-8" />
			{:else}
				<CircleCheckBig class="w-8 h-8" />
			{/if}
		</div>
		<div>
			<h2 class="text-3xl font-bold text-primary">
				{#if isRunningResearch}
					Research in Progress
				{:else if researchResult}
					Research Results for {stockSymbol.toUpperCase()}
				{:else}
					Research Complete
				{/if}
			</h2>
			<div class="flex items-center gap-3 mt-1">
				<p class="text-base-content/70">
					{#if isRunningResearch}
						Analyzing {stockSymbol.toUpperCase()} • Job ID: {currentJobId || 'N/A'}
					{:else if researchResult}
						Comprehensive market analysis complete
					{:else}
						Analysis completed for {stockSymbol.toUpperCase()}
					{/if}
				</p>
				{#if researchResult}
					<div class="badge badge-primary badge-lg">Comprehensive Analysis</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Process Toggle Button -->
	{#if jobStatus?.steps && jobStatus.steps.length > 0}
		<div class="flex gap-2">
			<button class="btn btn-outline btn-secondary" on:click={onViewProcess}>
				View Process ({jobStatus.steps.length} steps)
			</button>
		</div>
	{/if}
</div>
