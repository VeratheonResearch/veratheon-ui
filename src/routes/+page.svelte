<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import type { WorkflowResult } from '$lib/research-types';
  import ResearchInputCard from '$lib/components/ResearchInputCard.svelte';
  import ResearchStatusHeader from '$lib/components/ResearchStatusHeader.svelte';
  import ResearchFlowsSection from '$lib/components/ResearchFlowsSection.svelte';
  import ResearchReportDisplay from '$lib/components/ResearchReportDisplay.svelte';
  import { supabase } from '$lib/supabase';
  import { page } from '$app/stores';
  import { replaceState } from '$app/navigation';
  import { renderMarkdown } from '$lib/utils/markdown';
  import { startResearch as apiStartResearch, checkJobStatus, saveJobToHistory } from '$lib/api/research';
  import { createRealtimeResearch, type JobStatus, type SubJob } from '$lib/composables/useRealtimeResearch';
  import { showError, showWarning } from '$lib/utils/toast';

  // Total number of research steps (must match backend autonomous workflow agents)
  // 5 agents: quantitative, qualitative, macro, synthesis, trade_advice
  const TOTAL_RESEARCH_STEPS = 5;

  let stockSymbol = '';
  $: if (stockSymbol.trim()) {
    // This reactive statement will trigger when stockSymbol changes
    // The ReportStatusIndicator component will handle the actual API call
  }
  let isRunningResearch = false;
  let researchResult: WorkflowResult | null = null;
  let currentJobId: string | null = null;
  let jobStatus: JobStatus | null = null;
  let subJobs: SubJob[] = [];  // Track all subjobs
  let showFlows = true;  // Control flow boxes visibility
  let selectedFlow: SubJob | null = null;  // Track selected flow for future report viewing

  let isReconnecting = false;

  // Create realtime research manager
  const realtimeResearch = createRealtimeResearch({
    onJobUpdate: (status) => {
      jobStatus = status;
    },
    onSubJobUpdate: (subJob) => {
      // Check if subjob already exists
      const existingIndex = subJobs.findIndex(j => j.sub_job_id === subJob.sub_job_id);
      if (existingIndex >= 0) {
        // Update existing subjob
        subJobs[existingIndex] = subJob;
        subJobs = [...subJobs]; // Trigger reactivity
      } else {
        // Add new subjob
        subJobs = [...subJobs, subJob];
      }
    },
    onComplete: (result) => {
      researchResult = result;
      isRunningResearch = false;
    },
    onError: (error) => {
      showError(`Research failed: ${error}`);
      isRunningResearch = false;
    }
  });

  // Update browser tab title with completion percentage
  $: {
    if (typeof document !== 'undefined') {
      if (isRunningResearch && subJobs.length > 0) {
        // Calculate percentage based on total expected steps (14)
        const completedCount = subJobs.filter(j => j.status === 'completed').length;
        const percentage = Math.round((completedCount / TOTAL_RESEARCH_STEPS) * 100);
        document.title = `Research ${percentage}% - ${stockSymbol.toUpperCase() || 'Veratheon Research'}`;
      } else if (researchResult) {
        document.title = `Complete - ${stockSymbol.toUpperCase() || 'Veratheon Research'}`;
      } else {
        document.title = 'Veratheon Research';
      }
    }
  }

  // Get access token for API calls
  async function getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase!.auth.getSession();
    return session?.access_token || null;
  }

  async function runResearch() {
    if (!stockSymbol.trim()) {
      showWarning('Please enter a stock symbol');
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
      const startResult = await apiStartResearch(stockSymbol);
      console.log('Research started:', startResult);

      currentJobId = startResult.job_id;

      // Update URL with job_id and symbol for persistence across refreshes
      replaceState(`?job_id=${currentJobId}&symbol=${stockSymbol.trim().toUpperCase()}`, {});

      // Save to user history
      await saveJobToHistory(currentJobId, stockSymbol.trim().toUpperCase(), getAccessToken);

      // Get initial status
      const initialStatus = await checkJobStatus(currentJobId, stockSymbol);
      jobStatus = initialStatus;

      // Subscribe to real-time updates for this job
      await realtimeResearch.startTracking(currentJobId, stockSymbol.trim().toUpperCase());

    } catch (error) {
      console.error('Research error:', error);
      showError(`Research failed: ${error.message}`);
      isRunningResearch = false;
      realtimeResearch.cleanup();
    }
  }


  // Load job from URL params (for page refresh persistence)
  async function loadJobFromUrl() {
    const urlJobId = $page.url.searchParams.get('job_id');
    const urlSymbol = $page.url.searchParams.get('symbol');

    if (urlJobId && urlSymbol) {
      console.log('Loading job from URL:', urlJobId, urlSymbol);

      stockSymbol = urlSymbol;
      currentJobId = urlJobId;

      // Sync from database to get latest status
      await realtimeResearch.syncJobStatusFromDatabase(urlJobId);

      // After syncing, jobStatus should be populated by the state updater
      // Check if job is still running
      const currentStatus = jobStatus?.status;
      const isStillRunning = currentStatus !== 'completed' && currentStatus !== 'failed';

      if (isStillRunning) {
        console.log('Job from URL is still running, starting realtime tracking');
        isRunningResearch = true;
        await realtimeResearch.startTracking(urlJobId, urlSymbol);
      } else {
        console.log('Job from URL is completed/failed, displaying results');
        isRunningResearch = false;
      }

      return true; // Indicate that we loaded from URL
    }

    return false; // No job in URL
  }

  // Load historical job if passed via navigation state
  async function loadHistoricalJob() {
    const state = $page.state as any;
    if (state?.loadJob) {
      const { symbol, result, jobStatus: mainJob, subJobs: subs, steps } = state.loadJob;

      // Populate the UI with initial historical data
      stockSymbol = symbol;
      currentJobId = mainJob.main_job_id;

      // Update URL to persist this job
      replaceState(`?job_id=${mainJob.main_job_id}&symbol=${symbol}`, {});

      console.log('Loading historical job:', symbol, 'Status from history:', mainJob.status);

      // Always sync from database first to get the latest status
      // This ensures we have the most up-to-date information
      await realtimeResearch.syncJobStatusFromDatabase(mainJob.main_job_id);

      // After syncing, check the current status from the database
      // If sync didn't update jobStatus (e.g., no database access), use historical data
      if (!jobStatus) {
        jobStatus = {
          ...mainJob,
          steps: steps || []
        };
        subJobs = subs || [];
        researchResult = result;
      }

      // Determine if job is still running based on latest status
      const currentStatus = jobStatus?.status || mainJob.status;
      const isStillRunning = currentStatus !== 'completed' && currentStatus !== 'failed';

      if (isStillRunning) {
        console.log('Job is still running, starting realtime tracking:', symbol, 'Status:', currentStatus);
        isRunningResearch = true;

        // Start tracking the job with realtime updates
        // This will also sync from database again
        await realtimeResearch.startTracking(mainJob.main_job_id, symbol.toUpperCase());
      } else {
        console.log('Job is completed/failed, displaying results:', symbol, 'Status:', currentStatus);
        isRunningResearch = false;

        // Ensure we have the result displayed
        if (!researchResult && result) {
          researchResult = result;
        }
      }
    }
  }


  onMount(async () => {
    // Initialize realtime research with state updaters
    realtimeResearch.initialize({
      setJobStatus: (status) => { jobStatus = status; },
      setSubJobs: (jobs) => { subJobs = jobs; },
      setWorkflowResult: (result) => { researchResult = result; },
      setIsRunningResearch: (running) => { isRunningResearch = running; },
      setIsReconnecting: (reconnecting) => { isReconnecting = reconnecting; }
    });

    // Check URL params first (for page refresh persistence)
    const loadedFromUrl = await loadJobFromUrl();

    // If no URL params, check if we're loading from navigation state (history page)
    if (!loadedFromUrl) {
      await loadHistoricalJob();
    }
  });

  onDestroy(() => {
    realtimeResearch.cleanup();
  });
</script>

<div class="container mx-auto p-2 md:p-6">
  <div class="mb-4 md:mb-8">
    <ResearchInputCard
      bind:stockSymbol
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
</div>
