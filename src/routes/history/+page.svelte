<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';
  import { Clock, ChevronRight, AlertCircle, CheckCircle, Loader, XCircle, Lightbulb, FileText } from '@lucide/svelte';
  import { marked } from 'marked';
  import { showError } from '$lib/utils/toast';

  interface JobData {
    id: number;
    user_id: string;
    symbol: string;
    metadata: any;
    created_at: string;
    updated_at: string;
    status: string;
    job_data: any;
  }

  interface SelectedJobDetails {
    job: JobData;
    status: string;
    research_data: {
      main_job: any;
      sub_jobs: any[];
      result: any;
      steps: any[];
    };
  }

  let jobs: JobData[] = [];
  let loading = true;
  let error: string | null = null;
  let selectedJob: SelectedJobDetails | null = null;
  let loadingJobDetails = false;

  function renderMarkdown(text: string) {
    return marked(text);
  }

  // Check if a job is stalled (running/pending for more than 10 minutes)
  function getEffectiveStatus(job: JobData): string {
    const status = job.status;

    // If job is running or pending, check if it's stalled
    if (status === 'running' || status === 'pending') {
      const createdAt = new Date(job.created_at);
      const now = new Date();
      const minutesElapsed = (now.getTime() - createdAt.getTime()) / 1000 / 60;

      if (minutesElapsed > 10) {
        return 'stalled';
      }
    }

    return status;
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'running':
      case 'pending':
        return 'badge-info';
      case 'stalled':
        return 'badge-warning';
      case 'failed':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'running':
      case 'pending':
        return Loader;
      case 'stalled':
        return AlertCircle;
      case 'failed':
        return XCircle;
      default:
        return AlertCircle;
    }
  }

  async function loadJobs() {
    try {
      loading = true;
      error = null;

      // Get current session
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) {
        error = 'Please log in to view your job history';
        loading = false;
        return;
      }

      const response = await fetch('/api/user-jobs', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load jobs: ${response.statusText}`);
      }

      const data = await response.json();
      jobs = data.jobs || [];

    } catch (err) {
      console.error('Error loading jobs:', err);
      error = err instanceof Error ? err.message : 'Failed to load job history';
    } finally {
      loading = false;
    }
  }

  async function loadJobDetails(jobId: number) {
    try {
      loadingJobDetails = true;
      selectedJob = null;

      // Get current session
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) {
        return;
      }

      const response = await fetch(`/api/user-jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load job details: ${response.statusText}`);
      }

      selectedJob = await response.json();

    } catch (err) {
      console.error('Error loading job details:', err);
      showError('Failed to load job details');
    } finally {
      loadingJobDetails = false;
    }
  }

  function viewFullReport(job: SelectedJobDetails) {
    // Navigate to home page with job data in state
    goto('/', {
      state: {
        loadJob: {
          symbol: job.job.symbol,
          result: job.research_data.result,
          jobStatus: job.research_data.main_job,
          subJobs: job.research_data.sub_jobs,
          steps: job.research_data.steps
        }
      }
    });
  }

  onMount(() => {
    loadJobs();
  });
</script>

<div class="container mx-auto p-6">
  <div class="mb-8">
    <div class="flex items-center gap-4 mb-2">
      <Clock class="w-8 h-8 text-primary" />
      <h1 class="text-3xl font-bold text-primary">Research History</h1>
    </div>
    <p class="text-base-content/70">View and manage your past research jobs</p>
  </div>

  {#if loading}
    <div class="flex justify-center items-center py-20">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
  {:else if error}
    <div class="alert alert-error">
      <AlertCircle class="w-5 h-5" />
      <span>{error}</span>
    </div>
  {:else if jobs.length === 0}
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body text-center py-20">
        <Clock class="w-16 h-16 mx-auto text-base-content/30 mb-4" />
        <h2 class="text-2xl font-semibold mb-2">No Research History</h2>
        <p class="text-base-content/70">You haven't submitted any research jobs yet.</p>
        <div class="mt-6">
          <a href="/" class="btn btn-primary">Start Your First Research</a>
        </div>
      </div>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each jobs as job (job.id)}
        {@const effectiveStatus = getEffectiveStatus(job)}
        <button
          class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-base-200 text-left w-full"
          onclick={() => loadJobDetails(job.id)}
        >
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 flex-1">
                <div class="text-3xl font-bold text-primary">
                  {job.symbol}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm text-base-content/70">
                      {new Date(job.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class={`badge ${getStatusColor(effectiveStatus)}`}>
                      {effectiveStatus}
                    </div>
                    {#if effectiveStatus === 'running'}
                      <span class="text-xs text-base-content/60">In progress...</span>
                    {:else if effectiveStatus === 'stalled'}
                      <span class="text-xs text-base-content/60">Job may have stalled</span>
                    {/if}
                  </div>
                </div>
              </div>
              <ChevronRight class="w-6 h-6 text-base-content/40" />
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<!-- Job Details Modal -->
{#if selectedJob}
  {@const modalCreatedAt = new Date(selectedJob.job.created_at)}
  {@const modalMinutesElapsed = (new Date().getTime() - modalCreatedAt.getTime()) / 1000 / 60}
  {@const modalIsStalled = (selectedJob.status === 'running' || selectedJob.status === 'pending') && modalMinutesElapsed > 10}
  {@const displayStatus = modalIsStalled ? 'stalled' : selectedJob.status}

  <div class="modal modal-open">
    <div class="modal-box max-w-5xl max-h-[90vh]">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="text-4xl font-bold text-primary">
              {selectedJob.job.symbol}
            </div>
            <div class={`badge badge-lg ${getStatusColor(displayStatus)}`}>
              {displayStatus}
            </div>
          </div>
          <button class="btn btn-sm btn-circle btn-ghost" onclick={() => selectedJob = null}>✕</button>
        </div>

      <div class="mb-4 text-sm text-base-content/70">
        Submitted: {new Date(selectedJob.job.created_at).toLocaleString()}
      </div>

      {#if loadingJobDetails}
        <div class="flex justify-center py-20">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      {:else if selectedJob.status === 'completed' && selectedJob.research_data?.result?.synthesis_report}
        <!-- Synthesis Report Preview -->
        <div class="bg-gradient-to-r from-primary/15 to-secondary/15 rounded-xl p-6 border-2 border-primary/30 mb-6">
          <div class="flex items-center gap-3 mb-4">
            <Lightbulb class="w-6 h-6 text-primary" />
            <h3 class="text-xl font-bold text-primary">Investment Synthesis</h3>
          </div>

          <div class="prose max-w-none
                      prose-headings:text-primary prose-headings:font-bold
                      prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                      prose-p:text-base-content prose-p:leading-relaxed
                      prose-strong:text-primary prose-strong:font-semibold
                      prose-ul:space-y-2 prose-ol:space-y-2
                      prose-li:text-base-content">
            {@html renderMarkdown(selectedJob.research_data.result.synthesis_report)}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 justify-end">
          <button class="btn btn-outline" onclick={() => selectedJob = null}>
            Close
          </button>
          <button class="btn btn-primary gap-2" onclick={() => viewFullReport(selectedJob)}>
            <FileText class="w-4 h-4" />
            View Full Report
          </button>
        </div>
      {:else if selectedJob.status === 'running' || selectedJob.status === 'pending'}
        {@const createdAt = new Date(selectedJob.job.created_at)}
        {@const minutesElapsed = (new Date().getTime() - createdAt.getTime()) / 1000 / 60}
        {@const isStalled = minutesElapsed > 10}
        <div class="text-center py-12">
          {#if isStalled}
            <AlertCircle class="w-12 h-12 mx-auto text-warning mb-4" />
            <h3 class="text-lg font-semibold mb-2">Job May Have Stalled</h3>
            <p class="text-base-content/70 mb-6">
              This job has been running for over 10 minutes without completion. It may have encountered an issue.
            </p>
            <div class="badge badge-warning badge-lg mb-6">Started {Math.floor(minutesElapsed)} minutes ago</div>
            <div>
              <button class="btn btn-primary gap-2" onclick={() => viewFullReport(selectedJob)}>
                View Live Progress
              </button>
            </div>
          {:else}
            <Loader class="w-12 h-12 mx-auto text-info animate-spin mb-4" />
            <h3 class="text-lg font-semibold mb-2">Research In Progress</h3>
            <p class="text-base-content/70 mb-6">
              This job is currently running. You can close this and check back later.
            </p>
            <button class="btn btn-primary gap-2" onclick={() => viewFullReport(selectedJob)}>
              View Live Progress
            </button>
          {/if}
        </div>
      {:else if selectedJob.status === 'failed'}
        <div class="alert alert-error">
          <XCircle class="w-5 h-5" />
          <div>
            <div class="font-semibold">Job Failed</div>
            <div class="text-sm">{selectedJob.research_data.main_job?.error || 'An error occurred during research'}</div>
          </div>
        </div>
        <div class="modal-action">
          <button class="btn" onclick={() => selectedJob = null}>Close</button>
        </div>
      {:else}
        <div class="text-center py-12">
          <AlertCircle class="w-12 h-12 mx-auto text-warning mb-4" />
          <h3 class="text-lg font-semibold mb-2">No Results Available</h3>
          <p class="text-base-content/70">
            This job does not have any results to display.
          </p>
        </div>
        <div class="modal-action">
          <button class="btn" onclick={() => selectedJob = null}>Close</button>
        </div>
      {/if}
    </div>
    <button class="modal-backdrop" onclick={() => selectedJob = null} aria-label="Close modal"></button>
  </div>
{/if}
