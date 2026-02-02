<script lang="ts">
  // Typing indicator for agent thinking display
</script>

<div class="inline-flex gap-1">
  <span class="typing-dot"></span>
  <span class="typing-dot delay-1"></span>
  <span class="typing-dot delay-2"></span>
</div>

<style>
  .typing-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 9999px;
    background-color: oklch(var(--bc) / 0.4);
    animation: typing 1.4s infinite;
  }

  .typing-dot.delay-1 {
    animation-delay: 0.2s;
  }

  .typing-dot.delay-2 {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      opacity: 0.3;
      transform: translateY(0);
    }
    30% {
      opacity: 1;
      transform: translateY(-6px);
    }
  }
</style>
