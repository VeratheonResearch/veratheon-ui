<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import type { ResearchResult } from '$lib/research-types';
  import ResearchInputCard from '$lib/components/ResearchInputCard.svelte';
  import ResearchStatusHeader from '$lib/components/ResearchStatusHeader.svelte';
  import ResearchFlowsSection from '$lib/components/ResearchFlowsSection.svelte';
  import ResearchReportDisplay from '$lib/components/ResearchReportDisplay.svelte';
  import ProcessDetailsModal from '$lib/components/ProcessDetailsModal.svelte';
  import { supabase } from '$lib/supabase';
  import type { RealtimeChannel } from '@supabase/supabase-js';
  import { page } from '$app/stores';
  import { renderMarkdown } from '$lib/utils/markdown';
  import { startResearch as apiStartResearch, checkJobStatus, saveJobToHistory } from '$lib/api/research';

  // Configuration
  const MAX_STEPS = 29;

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

  interface SubJob {
    id: number;
    job_name: string;
    status: string;
    sub_job_id: string;
    created_at: string;
    updated_at: string;
    metadata?: any;
  }

  let stockSymbol = '';
  $: if (stockSymbol.trim()) {
    // This reactive statement will trigger when stockSymbol changes
    // The ReportStatusIndicator component will handle the actual API call
  }
  let forceRecompute = false;
  let isRunningResearch = false;
  let researchResult: ResearchResult | null = null;
  let currentJobId: string | null = null;
  let jobStatus: JobStatus | null = null;
  let subJobs: SubJob[] = [];  // Track all subjobs
  let showModal = false;
  let showFlows = true;  // Control flow boxes visibility
  let selectedFlow: SubJob | null = null;  // Track selected flow for future report viewing

  $: if (showModal) {
    // Scroll to bottom of modal when opened
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-box .space-y-2');
      if (modalContent) {
        modalContent.scrollTop = modalContent.scrollHeight;
      }
    }, 10);
  }

  let realtimeChannel: RealtimeChannel | null = null;

  // Update browser tab title with completion percentage
  $: {
    if (typeof document !== 'undefined') {
      if (isRunningResearch && jobStatus?.steps) {
        const percentage = Math.round((jobStatus.steps.length / MAX_STEPS) * 100);
        document.title = `Research ${percentage}% - ${stockSymbol.toUpperCase() || 'Veratheon Research'}`;
      } else if (researchResult) {
        document.title = `Complete - ${stockSymbol.toUpperCase() || 'Veratheon Research'}`;
      } else {
        document.title = 'Veratheon Research';
      }
    }
  }

  // Get preferred model from localStorage
  function getPreferredModel(): string {
    try {
      const savedModel = localStorage.getItem('preferredModel');
      return savedModel || 'o4_mini';
    } catch (e) {
      console.warn('Failed to read preferred model from localStorage:', e);
      return 'o4_mini';
    }
  }

  // Get access token for API calls
  async function getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase!.auth.getSession();
    return session?.access_token || null;
  }

  async function runResearch() {
    if (!stockSymbol.trim()) {
      alert('Please enter a stock symbol');
      return;
    }

    // Clear old data for new research run
    researchResult = null;
    jobStatus = null;
    subJobs = [];
    currentJobId = null;

    isRunningResearch = true;

    try {
      // Start research and get job ID
      const preferredModel = getPreferredModel();
      const startResult = await apiStartResearch(stockSymbol, forceRecompute, preferredModel);
      console.log('Research started:', startResult);

      currentJobId = startResult.job_id;

      // Save to user history
      await saveJobToHistory(currentJobId, stockSymbol.trim().toUpperCase(), forceRecompute, getAccessToken);

      // Get initial status
      const initialStatus = await checkJobStatus(currentJobId, stockSymbol);
      jobStatus = initialStatus;

      // Subscribe to real-time updates for this job
      if (supabase) {
        // Unsubscribe from previous channel if exists
        if (realtimeChannel) {
          await supabase.removeChannel(realtimeChannel);
          realtimeChannel = null;
        }

        realtimeChannel = supabase
          .channel(`research_job_${currentJobId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'research_jobs',
              filter: `main_job_id=eq.${currentJobId}`
            },
            (payload) => {
              console.log('Realtime job INSERT:', payload);
              const newJob = payload.new;

              // Add new subjob to list
              if (newJob.sub_job_id) {
                subJobs = [...subJobs, {
                  id: newJob.id,
                  job_name: newJob.job_name,
                  status: newJob.status,
                  sub_job_id: newJob.sub_job_id,
                  created_at: newJob.created_at,
                  updated_at: newJob.updated_at,
                  metadata: newJob.metadata
                }];
              } else {
                // This is the main job
                jobStatus = {
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
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'research_jobs',
              filter: `main_job_id=eq.${currentJobId}`
            },
            (payload) => {
              console.log('Realtime job UPDATE:', payload);
              const updatedJob = payload.new;

              // Update subjob if it has sub_job_id
              if (updatedJob.sub_job_id) {
                subJobs = subJobs.map(job =>
                  job.sub_job_id === updatedJob.sub_job_id
                    ? {
                        ...job,
                        status: updatedJob.status,
                        updated_at: updatedJob.updated_at,
                        metadata: updatedJob.metadata
                      }
                    : job
                );
              } else {
                // Update main job status
                jobStatus = {
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
              }

              // Check if main flow is completed
              if (updatedJob.job_name === 'main_flow' && updatedJob.status === 'completed') {
                console.log('Research completed:', updatedJob.metadata?.result);
                researchResult = updatedJob.metadata?.result as ResearchResult;
                isRunningResearch = false;

                // Unsubscribe after completion
                if (realtimeChannel) {
                  supabase.removeChannel(realtimeChannel);
                  realtimeChannel = null;
                }
              } else if (updatedJob.job_name === 'main_flow' && updatedJob.status === 'failed') {
                console.error('Research failed:', updatedJob.error);
                alert(`Research failed: ${updatedJob.error}`);
                isRunningResearch = false;

                // Unsubscribe after failure
                if (realtimeChannel) {
                  supabase.removeChannel(realtimeChannel);
                  realtimeChannel = null;
                }
              }
            }
          )
          .subscribe((status) => {
            console.log('Realtime subscription status:', status);
          });
      } else {
        console.warn('Supabase client not available, falling back to polling');
        // Fallback to polling if Supabase is not available
        startPolling();
      }

    } catch (error) {
      console.error('Research error:', error);
      alert(`Research failed: ${error.message}`);
      isRunningResearch = false;
      if (realtimeChannel && supabase) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    }
  }

  // Fallback polling function (used if Supabase Realtime is not available)
  function startPolling() {
    const pollInterval = setInterval(async () => {
      try {
        if (!currentJobId) {
          clearInterval(pollInterval);
          return;
        }

        const status = await checkJobStatus(currentJobId, stockSymbol);
        console.log('Polling job status:', status);

        jobStatus = status;

        if (status.completed) {
          console.log('Research completed:', status.result);
          researchResult = status.result as ResearchResult;
          isRunningResearch = false;
          clearInterval(pollInterval);
        } else if (status.error) {
          console.error('Research failed:', status.error);
          alert(`Research failed: ${status.error}`);
          isRunningResearch = false;
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 3000);
  }

  // Load historical job if passed via navigation state
  function loadHistoricalJob() {
    const state = $page.state as any;
    if (state?.loadJob) {
      const { symbol, result, jobStatus: mainJob, subJobs: subs, steps } = state.loadJob;

      // Populate the UI with historical data
      stockSymbol = symbol;
      researchResult = result;
      jobStatus = {
        ...mainJob,
        steps: steps || []
      };
      subJobs = subs || [];
      currentJobId = mainJob.main_job_id;
      isRunningResearch = false;

      console.log('Loaded historical job:', symbol);
    }
  }

  onMount(() => {
    // Check if we're loading a historical job
    loadHistoricalJob();
  });

  onDestroy(() => {
    if (realtimeChannel && supabase) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  });
</script>

<div class="container mx-auto p-2 md:p-6">
  <div class="mb-4 md:mb-8">
    <ResearchInputCard
      bind:stockSymbol
      bind:forceRecompute
      {isRunningResearch}
      onStartResearch={runResearch}
    />
  </div>
  

  <!-- Research & Status Unified Section -->
  {#if isRunningResearch || jobStatus || researchResult}
    <div class="mt-4 md:mt-8" transition:slide={{ duration: 400 }}>
      <!-- Unified Research Card -->
      <div class="card bg-base-100 shadow-2xl border border-primary/20">
        <div class="card-body p-3 md:p-6 lg:p-8">
          <ResearchStatusHeader
            {isRunningResearch}
            {researchResult}
            {stockSymbol}
            {currentJobId}
            {jobStatus}
            onViewProcess={() => showModal = true}
          />

          <ResearchFlowsSection
            {subJobs}
            {isRunningResearch}
            bind:showFlows
            onFlowSelect={(subJob) => {
              selectedFlow = subJob;
              console.log('Selected flow:', subJob.job_name, subJob);
            }}
          />

          <ResearchReportDisplay
            {researchResult}
            {isRunningResearch}
            {stockSymbol}
            {renderMarkdown}
          />
        </div>
      </div>
    </div>
  {/if}

  <ProcessDetailsModal
    bind:isOpen={showModal}
    {jobStatus}
    {stockSymbol}
    {isRunningResearch}
    onClose={() => showModal = false}
  />
</div>
