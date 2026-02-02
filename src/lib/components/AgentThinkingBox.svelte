<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import ThinkingMessage from './ThinkingMessage.svelte';
  import TypingIndicator from './TypingIndicator.svelte';
  import type { AgentStatusMessage } from '$lib/types/agentStatus';

  interface Props {
    jobId: string;
    agentName: string;
    agentDisplayName: string;
    isRunning: boolean;
  }

  let { jobId, agentName, agentDisplayName, isRunning }: Props = $props();

  let messages: AgentStatusMessage[] = $state([]);
  let expanded = $state(true);
  let eventSource: EventSource | null = $state(null);
  let messagesContainer: HTMLElement | null = $state(null);
  let streamEnded = $state(false);

  onMount(() => {
    // Connect to SSE stream
    eventSource = new EventSource(`/api/research/stream/${jobId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Check for stream end message
        if (data.type === 'stream_end') {
          streamEnded = true;
          eventSource?.close();
          return;
        }

        // Only show messages for this agent
        if (data.agent_name === agentName) {
          messages = [...messages, data];

          // Auto-scroll to bottom
          setTimeout(() => {
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      // Only log error if stream didn't end gracefully
      if (!streamEnded && eventSource?.readyState === EventSource.CLOSED) {
        console.warn('SSE connection closed unexpectedly');
      }
      eventSource?.close();
    };
  });

  onDestroy(() => {
    eventSource?.close();
  });
</script>

<div class="border border-base-300 rounded-lg mb-3 bg-base-100 overflow-hidden">
  <button
    class="w-full px-4 py-3 flex justify-between items-center bg-base-200 hover:bg-base-300 border-0 cursor-pointer transition-colors"
    onclick={() => expanded = !expanded}
  >
    <div class="flex items-center gap-3">
      <div class="w-5 h-5 flex items-center justify-center">
        {#if isRunning}
          <div class="pulsing-dot"></div>
        {:else}
          <div class="text-success text-xl font-bold">✓</div>
        {/if}
      </div>
      <span class="font-semibold text-base-content">{agentDisplayName}</span>
      {#if messages.length > 0}
        <span class="text-sm text-base-content/60">{messages.length} updates</span>
      {/if}
    </div>
    <div class="transition-transform text-base-content {expanded ? '' : '-rotate-90'}">▼</div>
  </button>

  {#if expanded}
    <div class="max-h-96 overflow-y-auto px-4 py-3 bg-base-100" bind:this={messagesContainer}>
      {#if messages.length === 0 && isRunning}
        <div class="flex items-center gap-2 text-base-content/60 text-sm">
          <TypingIndicator />
          <span>Initializing...</span>
        </div>
      {:else}
        {#each messages as message (message.id)}
          <ThinkingMessage {message} />
        {/each}

        {#if isRunning}
          <div class="mt-2">
            <TypingIndicator />
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .pulsing-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 9999px;
    background-color: oklch(var(--p));
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>
