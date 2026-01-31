/**
 * Composable for managing Supabase Realtime subscriptions for research jobs
 * with automatic reconnection, database sync, and fallback to polling
 */

import { supabase } from '$lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { WorkflowResult } from '$lib/research-types';
import { checkJobStatus } from '$lib/api/research';

export interface JobStep {
	step: string;
	timestamp: string;
	status: string;
}

export interface JobStatus {
	job_id?: string;
	main_job_id?: string;
	sub_job_id?: string;
	job_name?: string;
	symbol?: string;
	status?: string;
	completed?: boolean;
	result?: WorkflowResult;
	error?: string;
	steps?: JobStep[];
	created_at?: string;
	updated_at?: string;
}

export interface SubJob {
	id: number;
	job_name: string;
	status: string;
	sub_job_id: string;
	created_at: string;
	updated_at: string;
	metadata?: any;
}

interface RealtimeResearchState {
	jobStatus: JobStatus | null;
	subJobs: SubJob[];
	researchResult: WorkflowResult | null;
	isRunningResearch: boolean;
	isReconnecting: boolean;
}

interface RealtimeResearchCallbacks {
	onJobUpdate?: (jobStatus: JobStatus) => void;
	onSubJobUpdate?: (subJob: SubJob) => void;
	onComplete?: (result: WorkflowResult) => void;
	onError?: (error: string) => void;
}

export function createRealtimeResearch(callbacks?: RealtimeResearchCallbacks) {
	let realtimeChannel: RealtimeChannel | null = null;
	let reconnectAttempts = 0;
	let maxReconnectAttempts = 5;
	let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
	let isReconnecting = false;
	let currentJobId: string | null = null;
	let stockSymbol = '';
	let pollingInterval: ReturnType<typeof setInterval> | null = null;

	// State updaters - these should be bound to reactive state in the component
	let stateUpdaters: {
		setJobStatus: (status: JobStatus | null) => void;
		setSubJobs: (jobs: SubJob[]) => void;
		setWorkflowResult: (result: WorkflowResult | null) => void;
		setIsRunningResearch: (running: boolean) => void;
		setIsReconnecting: (reconnecting: boolean) => void;
	} | null = null;

	/**
	 * Fetch current job status from database to sync state
	 */
	async function syncJobStatusFromDatabase(jobId: string): Promise<void> {
		if (!supabase) {
			console.warn('Supabase client not available');
			return;
		}

		try {
			console.log(`Syncing job status from database for job ${jobId}`);

			// Fetch all jobs for this main_job_id
			const { data: jobs, error } = await supabase
				.from('research_jobs')
				.select('*')
				.eq('main_job_id', jobId)
				.order('created_at', { ascending: true });

			if (error) {
				console.error('Error fetching job status:', error);
				return;
			}

			if (!jobs || jobs.length === 0) {
				console.warn('No jobs found for job_id:', jobId);
				return;
			}

			console.log(`Found ${jobs.length} jobs in database`);

			// Separate main job and subjobs
			const mainJob = jobs.find((j) => j.job_name === 'main_flow');
			const fetchedSubJobs = jobs.filter((j) => j.sub_job_id);

			// Update main job status
			if (mainJob && stateUpdaters) {
				const newJobStatus: JobStatus = {
					job_id: mainJob.id,
					main_job_id: mainJob.main_job_id,
					job_name: mainJob.job_name,
					symbol: mainJob.symbol,
					status: mainJob.status,
					completed: mainJob.status === 'completed',
					error: mainJob.error,
					steps: mainJob.metadata?.steps || [],
					created_at: mainJob.created_at,
					updated_at: mainJob.updated_at,
					result: mainJob.metadata?.result
				};

				stateUpdaters.setJobStatus(newJobStatus);
				callbacks?.onJobUpdate?.(newJobStatus);

				// Check if job is already completed
				if (mainJob.status === 'completed') {
					console.log('Job already completed, updating result');
					const result = mainJob.metadata?.result as WorkflowResult;
					stateUpdaters.setWorkflowResult(result);
					stateUpdaters.setIsRunningResearch(false);
					callbacks?.onComplete?.(result);
				} else if (mainJob.status === 'failed') {
					console.log('Job already failed');
					stateUpdaters.setIsRunningResearch(false);
					callbacks?.onError?.(mainJob.error || 'Job failed');
				}
			}

			// Update subjobs
			if (stateUpdaters) {
				const newSubJobs = fetchedSubJobs.map((job) => ({
					id: job.id,
					job_name: job.job_name,
					status: job.status,
					sub_job_id: job.sub_job_id,
					created_at: job.created_at,
					updated_at: job.updated_at,
					metadata: job.metadata
				}));
				stateUpdaters.setSubJobs(newSubJobs);
			}

			console.log('Job status synced from database');
		} catch (error) {
			console.error('Error syncing job status:', error);
		}
	}

	/**
	 * Subscribe to realtime updates for a job
	 */
	async function subscribeToRealtimeUpdates(jobId: string): Promise<void> {
		if (!supabase) {
			console.warn('Supabase client not available, falling back to polling');
			startPolling(jobId);
			return;
		}

		// Sync current state from database before subscribing
		await syncJobStatusFromDatabase(jobId);

		// Unsubscribe from previous channel if exists
		if (realtimeChannel) {
			await supabase.removeChannel(realtimeChannel);
			realtimeChannel = null;
		}

		console.log(`Subscribing to realtime updates for job ${jobId}`);

		realtimeChannel = supabase
			.channel(`research_job_${jobId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'research_jobs',
					filter: `main_job_id=eq.${jobId}`
				},
				(payload) => {
					console.log('Realtime job INSERT:', payload);
					const newJob = payload.new;

					if (!stateUpdaters) return;

					// Add new subjob to list
					if (newJob.sub_job_id) {
						const subJob: SubJob = {
							id: newJob.id,
							job_name: newJob.job_name,
							status: newJob.status,
							sub_job_id: newJob.sub_job_id,
							created_at: newJob.created_at,
							updated_at: newJob.updated_at,
							metadata: newJob.metadata
						};
						// This needs to be handled by the component to append to array
						callbacks?.onSubJobUpdate?.(subJob);
					} else {
						// This is the main job
						const newJobStatus: JobStatus = {
							job_id: newJob.id,
							main_job_id: newJob.main_job_id,
							job_name: newJob.job_name,
							symbol: newJob.symbol,
							status: newJob.status,
							completed: newJob.status === 'completed',
							error: newJob.error,
							steps: newJob.metadata?.steps || [],
							created_at: newJob.created_at,
							updated_at: newJob.updated_at,
							result: newJob.metadata?.result
						};
						stateUpdaters.setJobStatus(newJobStatus);
						callbacks?.onJobUpdate?.(newJobStatus);
					}
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'research_jobs',
					filter: `main_job_id=eq.${jobId}`
				},
				(payload) => {
					console.log('Realtime job UPDATE:', payload);
					const updatedJob = payload.new;
					console.log('🔍 DEBUG UPDATE: job_name=', updatedJob.job_name, 'status=', updatedJob.status, 'has_sub_job_id=', !!updatedJob.sub_job_id);

					if (!stateUpdaters) return;

					// Update subjob if it has sub_job_id
					if (updatedJob.sub_job_id) {
						const subJob: SubJob = {
							id: updatedJob.id,
							job_name: updatedJob.job_name,
							status: updatedJob.status,
							sub_job_id: updatedJob.sub_job_id,
							created_at: updatedJob.created_at,
							updated_at: updatedJob.updated_at,
							metadata: updatedJob.metadata
						};
						callbacks?.onSubJobUpdate?.(subJob);
					} else {
						// Update main job status
						const newJobStatus: JobStatus = {
							job_id: updatedJob.id,
							main_job_id: updatedJob.main_job_id,
							job_name: updatedJob.job_name,
							symbol: updatedJob.symbol,
							status: updatedJob.status,
							completed: updatedJob.status === 'completed',
							error: updatedJob.error,
							steps: updatedJob.metadata?.steps || [],
							created_at: updatedJob.created_at,
							updated_at: updatedJob.updated_at,
							result: updatedJob.metadata?.result
						};
						stateUpdaters.setJobStatus(newJobStatus);
						callbacks?.onJobUpdate?.(newJobStatus);

						// Check if main flow is completed
						console.log('🎯 DEBUG: Checking main flow completion - job_name:', updatedJob.job_name, 'status:', updatedJob.status);
						if (updatedJob.job_name === 'main_flow' && updatedJob.status === 'completed') {
							console.log('✅ Research completed! Metadata result:', updatedJob.metadata?.result);
							console.log('📊 Result structure:', {
								hasResult: !!updatedJob.metadata?.result,
								hasSynthesisReport: !!updatedJob.metadata?.result?.synthesis_report,
								hasQuantitativeReport: !!updatedJob.metadata?.result?.quantitative_report
							});
							const result = updatedJob.metadata?.result as WorkflowResult;
							stateUpdaters.setWorkflowResult(result);
							stateUpdaters.setIsRunningResearch(false);
							callbacks?.onComplete?.(result);

							// Unsubscribe after completion
							cleanup();
						} else if (updatedJob.job_name === 'main_flow' && updatedJob.status === 'failed') {
							console.error('Research failed:', updatedJob.error);
							stateUpdaters.setIsRunningResearch(false);
							callbacks?.onError?.(updatedJob.error || 'Research failed');

							// Unsubscribe after failure
							cleanup();
						}
					}
				}
			)
			.subscribe((status) => {
				console.log('Realtime subscription status:', status);

				// Handle subscription status changes
				if (status === 'SUBSCRIBED') {
					console.log('Successfully subscribed to realtime updates');
					reconnectAttempts = 0;
					isReconnecting = false;
					if (stateUpdaters) {
						stateUpdaters.setIsReconnecting(false);
					}
					// Sync state from database after successful subscription
					syncJobStatusFromDatabase(jobId);
				} else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
					console.error('Realtime subscription error:', status);
					handleReconnect(jobId);
				} else if (status === 'CLOSED') {
					console.warn('Realtime subscription closed');
					// Only reconnect if we still have an active job
					if (stateUpdaters && currentJobId === jobId) {
						handleReconnect(jobId);
					}
				}
			});
	}

	/**
	 * Handle reconnection with exponential backoff
	 */
	function handleReconnect(jobId: string): void {
		if (currentJobId !== jobId) {
			console.log('Skipping reconnect - job no longer active');
			return;
		}

		if (reconnectAttempts >= maxReconnectAttempts) {
			console.error('Max reconnection attempts reached, falling back to polling');
			isReconnecting = false;
			if (stateUpdaters) {
				stateUpdaters.setIsReconnecting(false);
			}
			startPolling(jobId);
			return;
		}

		if (isReconnecting) {
			console.log('Reconnection already in progress');
			return;
		}

		isReconnecting = true;
		if (stateUpdaters) {
			stateUpdaters.setIsReconnecting(true);
		}
		reconnectAttempts++;

		// Exponential backoff: 1s, 2s, 4s, 8s, 16s
		const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 16000);
		console.log(
			`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`
		);

		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
		}

		reconnectTimeout = setTimeout(async () => {
			console.log('Reconnecting to realtime...');
			await subscribeToRealtimeUpdates(jobId);
		}, delay);
	}

	/**
	 * Fallback polling function (used if Supabase Realtime is not available)
	 */
	function startPolling(jobId: string): void {
		// Clear any existing polling interval
		if (pollingInterval) {
			clearInterval(pollingInterval);
		}

		pollingInterval = setInterval(async () => {
			try {
				if (!currentJobId || currentJobId !== jobId) {
					if (pollingInterval) {
						clearInterval(pollingInterval);
						pollingInterval = null;
					}
					return;
				}

				const status = await checkJobStatus(jobId, stockSymbol);
				console.log('Polling job status:', status);

				if (stateUpdaters) {
					stateUpdaters.setJobStatus(status);
					callbacks?.onJobUpdate?.(status);

					if (status.completed) {
						console.log('Research completed:', status.result);
						stateUpdaters.setWorkflowResult(status.result as WorkflowResult);
						stateUpdaters.setIsRunningResearch(false);
						callbacks?.onComplete?.(status.result as WorkflowResult);
						if (pollingInterval) {
							clearInterval(pollingInterval);
							pollingInterval = null;
						}
					} else if (status.error) {
						console.error('Research failed:', status.error);
						stateUpdaters.setIsRunningResearch(false);
						callbacks?.onError?.(status.error);
						if (pollingInterval) {
							clearInterval(pollingInterval);
							pollingInterval = null;
						}
					}
				}
			} catch (error) {
				console.error('Status check error:', error);
			}
		}, 3000);
	}

	/**
	 * Handle page visibility changes (tab switching, minimize/restore)
	 */
	function handleVisibilityChange(): void {
		if (document.visibilityState === 'visible' && currentJobId) {
			console.log('Page became visible, checking realtime connection');

			// Check if channel is still subscribed
			if (!realtimeChannel || realtimeChannel.state !== 'joined') {
				console.log('Realtime channel not active, reconnecting...');
				reconnectAttempts = 0; // Reset attempts on visibility change
				subscribeToRealtimeUpdates(currentJobId);
			}
		}
	}

	/**
	 * Handle network online event
	 */
	function handleOnline(): void {
		console.log('Network connection restored');
		if (currentJobId) {
			reconnectAttempts = 0;
			subscribeToRealtimeUpdates(currentJobId);
		}
	}

	/**
	 * Handle network offline event
	 */
	function handleOffline(): void {
		console.log('Network connection lost');
	}

	/**
	 * Initialize the composable with state updaters
	 */
	function initialize(updaters: typeof stateUpdaters): void {
		stateUpdaters = updaters;

		// Listen for page visibility changes
		if (typeof document !== 'undefined') {
			document.addEventListener('visibilitychange', handleVisibilityChange);
		}

		// Listen for online/offline events
		if (typeof window !== 'undefined') {
			window.addEventListener('online', handleOnline);
			window.addEventListener('offline', handleOffline);
		}
	}

	/**
	 * Start tracking a research job
	 */
	async function startTracking(jobId: string, symbol: string): Promise<void> {
		currentJobId = jobId;
		stockSymbol = symbol;
		await subscribeToRealtimeUpdates(jobId);
	}

	/**
	 * Clean up all subscriptions and listeners
	 */
	function cleanup(): void {
		// Clean up realtime channel
		if (realtimeChannel && supabase) {
			supabase.removeChannel(realtimeChannel);
			realtimeChannel = null;
		}

		// Clean up reconnect timeout
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}

		// Clean up polling interval
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}

		// Remove event listeners
		if (typeof document !== 'undefined') {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		}

		if (typeof window !== 'undefined') {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		}

		currentJobId = null;
		reconnectAttempts = 0;
		isReconnecting = false;
	}

	return {
		initialize,
		startTracking,
		cleanup,
		syncJobStatusFromDatabase
	};
}
