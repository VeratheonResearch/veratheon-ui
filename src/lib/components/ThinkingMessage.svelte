<script lang="ts">
  import type { AgentStatusMessage } from '$lib/types/agentStatus';

  interface Props {
    message: AgentStatusMessage;
  }

  let { message }: Props = $props();

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
</script>

<div class="py-2 border-b border-base-300 last:border-b-0 animate-slide-in">
  <div class="flex justify-between mb-1">
    <span class="text-xs text-base-content/40">{formatTime(message.created_at)}</span>
    {#if message.progress_percent !== null && message.progress_percent !== undefined}
      <span class="text-xs text-primary font-semibold">{message.progress_percent}%</span>
    {/if}
  </div>
  <div class="text-sm leading-relaxed {message.message_type === 'success' ? 'text-success font-medium' : 'text-base-content'}">
    {message.message}
  </div>
  {#if message.progress_percent !== null && message.progress_percent !== undefined}
    <div class="mt-1.5 h-1 bg-base-300 rounded-sm overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-primary to-primary-focus transition-all duration-300"
        style="width: {message.progress_percent}%"
      ></div>
    </div>
  {/if}
</div>

<style>
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-in {
    animation: slideIn 0.3s ease-out;
  }
</style>
