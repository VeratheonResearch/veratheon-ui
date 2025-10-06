<script lang="ts">
	import { ListEnd } from '@lucide/svelte';
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
		isOpen = $bindable(false),
		jobStatus,
		stockSymbol,
		isRunningResearch,
		onClose
	}: {
		isOpen: boolean;
		jobStatus: JobStatus | null;
		stockSymbol: string;
		isRunningResearch: boolean;
		onClose: () => void;
	} = $props();
</script>

<div class="modal" class:modal-open={isOpen}>
	<div class="modal-box max-w-4xl max-h-[85vh] overflow-y-auto" style="width: 90vw; padding: 0.75rem; margin-left: auto; margin-right: auto;">
		<div class="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
			<div class="text-primary">
				<ListEnd class="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
			</div>
			<h3 class="font-bold text-base md:text-lg lg:text-xl text-primary">Research Process Details</h3>
		</div>

		<div class="mb-3 md:mb-4">
			<div class="grid grid-cols-3 gap-2 md:gap-0 md:flex md:stats md:shadow w-full bg-base-200 md:bg-transparent rounded-lg md:rounded-none p-2 md:p-0">
				<div class="flex flex-col items-center md:stat md:py-3 md:px-4">
					<div class="text-xs text-base-content/60 md:stat-title md:text-xs md:md:text-sm mb-1">Total Steps</div>
					<div class="text-xl font-bold md:stat-value md:text-2xl md:md:text-3xl lg:text-4xl text-primary">{jobStatus?.steps?.length || 0}</div>
				</div>
				<div class="flex flex-col items-center md:stat md:py-3 md:px-4">
					<div class="text-xs text-base-content/60 md:stat-title md:text-xs md:md:text-sm mb-1">Symbol</div>
					<div class="text-xl font-bold md:stat-value md:text-2xl md:md:text-3xl lg:text-4xl text-secondary">{stockSymbol.toUpperCase() || 'N/A'}</div>
				</div>
				<div class="flex flex-col items-center md:stat md:py-3 md:px-4">
					<div class="text-xs text-base-content/60 md:stat-title md:text-xs md:md:text-sm mb-1">Status</div>
					<div class="text-xl font-bold md:stat-value md:text-2xl md:md:text-3xl lg:text-4xl text-accent">
						{#if isRunningResearch}
							In Progress
						{:else}
							Complete
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="py-2 md:py-4">
		{#if !jobStatus?.steps || jobStatus.steps.length === 0}
			<div class="text-center py-6 md:py-8 text-sm md:text-base text-base-content/60">No process steps recorded yet</div>
		{:else}
			<div class="space-y-2 md:space-y-3 max-h-64 md:max-h-96 overflow-y-auto">
				{#each jobStatus.steps as step, index (step.timestamp)}
						<div class="card bg-base-100 shadow-sm border border-base-200">
							<div class="card-body p-2 md:p-4">
								<div class="flex flex-col sm:flex-row justify-between items-start gap-2">
									<div class="flex items-start gap-2 md:gap-3 flex-1 w-full">
										<div
											class="w-2 h-2 md:w-3 md:h-3 rounded-full mt-1 md:mt-2 flex-shrink-0 {step.status === 'completed'
												? 'bg-success'
												: step.status === 'running'
													? 'bg-info'
													: 'bg-secondary'}"
										></div>
										<div class="flex-1 min-w-0">
											<div class="font-medium text-sm md:text-base text-base-content mb-0.5 md:mb-1 break-words">
												{step.step}
											</div>
											<div class="text-xs md:text-sm text-base-content/60">
												Step {index + 1} • {new Date(step.timestamp).toLocaleString()}
											</div>
										</div>
									</div>
									<div
										class="badge {step.status === 'completed'
											? 'badge-success'
											: step.status === 'running'
												? 'badge-info'
												: 'badge-secondary'} badge-xs md:badge-sm whitespace-nowrap flex-shrink-0"
									>
										{step.status}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="modal-action mt-3 md:mt-4">
			<button class="btn btn-primary btn-sm md:btn-md w-full sm:w-auto" onclick={onClose}>Close</button>
		</div>
	</div>
</div>
