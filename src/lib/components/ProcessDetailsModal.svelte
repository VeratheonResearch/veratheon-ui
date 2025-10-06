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
	<div class="modal-box max-w-4xl">
		<div class="flex items-center gap-3 mb-4">
			<div class="text-primary text-2xl">
				<ListEnd class="w-7 h-7" />
			</div>
			<h3 class="font-bold text-xl text-primary">Research Process Details</h3>
		</div>

		<div class="mb-4">
			<div class="stats shadow w-full">
				<div class="stat">
					<div class="stat-title">Total Steps</div>
					<div class="stat-value text-primary">{jobStatus?.steps?.length || 0}</div>
				</div>
				<div class="stat">
					<div class="stat-title">Symbol</div>
					<div class="stat-value text-secondary">{stockSymbol.toUpperCase() || 'N/A'}</div>
				</div>
				<div class="stat">
					<div class="stat-title">Status</div>
					<div class="stat-value text-accent">
						{#if isRunningResearch}
							In Progress
						{:else}
							Complete
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="py-4">
			{#if !jobStatus?.steps || jobStatus.steps.length === 0}
				<div class="text-center py-8 text-base-content/60">No process steps recorded yet</div>
			{:else}
				<div class="space-y-3 max-h-96 overflow-y-auto">
					{#each jobStatus.steps as step, index (step.timestamp)}
						<div class="card bg-base-100 shadow-sm border border-base-200">
							<div class="card-body p-4">
								<div class="flex justify-between items-start">
									<div class="flex items-start gap-3 flex-1">
										<div
											class="w-3 h-3 rounded-full mt-2 {step.status === 'completed'
												? 'bg-success'
												: step.status === 'running'
													? 'bg-info'
													: 'bg-secondary'}"
										></div>
										<div class="flex-1">
											<div class="font-medium text-base-content mb-1">
												{step.step}
											</div>
											<div class="text-sm text-base-content/60">
												Step {index + 1} • {new Date(step.timestamp).toLocaleString()}
											</div>
										</div>
									</div>
									<div
										class="badge {step.status === 'completed'
											? 'badge-success'
											: step.status === 'running'
												? 'badge-info'
												: 'badge-secondary'} badge-sm"
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

		<div class="modal-action">
			<button class="btn btn-primary" on:click={onClose}>Close</button>
		</div>
	</div>
</div>
