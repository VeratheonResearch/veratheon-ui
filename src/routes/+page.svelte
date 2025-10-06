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
  import { page } from '$app/stores';
  import { renderMarkdown } from '$lib/utils/markdown';
  import { startResearch as apiStartResearch, checkJobStatus, saveJobToHistory } from '$lib/api/research';
  import { createRealtimeResearch, type JobStatus, type SubJob } from '$lib/composables/useRealtimeResearch';

  // Configuration
  const MAX_STEPS = 29;

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
      alert(`Research failed: ${error}`);
      isRunningResearch = false;
    }
  });

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
      await realtimeResearch.startTracking(currentJobId, stockSymbol.trim().toUpperCase());

    } catch (error) {
      console.error('Research error:', error);
      alert(`Research failed: ${error.message}`);
      isRunningResearch = false;
      realtimeResearch.cleanup();
    }
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
    // Initialize realtime research with state updaters
    realtimeResearch.initialize({
      setJobStatus: (status) => { jobStatus = status; },
      setSubJobs: (jobs) => { subJobs = jobs; },
      setResearchResult: (result) => { researchResult = result; },
      setIsRunningResearch: (running) => { isRunningResearch = running; },
      setIsReconnecting: (reconnecting) => { isReconnecting = reconnecting; }
    });

    // Check if we're loading a historical job
    loadHistoricalJob();
  });

  onDestroy(() => {
    realtimeResearch.cleanup();
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
