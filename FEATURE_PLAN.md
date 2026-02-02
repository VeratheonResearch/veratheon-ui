# VeratheonResearch UX Implementation Plan

**Version**: 2.0
**Date**: 2026-02-01
**Status**: Active Implementation

---

## Progress Tracker

### Overall Completion: 8% (2/24 features)

### Phase Status

- [ ] **Phase 1: Error Handling Foundation** (2/5 complete)
- [ ] **Phase 2: Trade System Completion** (0/6 complete)
- [ ] **Phase 3: Research Report Enhancements** (0/2 complete)
- [ ] **Phase 4: User Productivity** (0/3 complete)
- [ ] **Phase 5: Mobile & Performance** (0/6 complete)

### Feature Checklist

#### Phase 1: Error Handling Foundation
- [x] 1.1 Toast Notification System
- [x] 1.2 Detailed Error Messages
- [ ] 1.3 Job Retry Mechanism
- [ ] 1.4 Job Cancellation
- [ ] 1.5 Real-time Agent Thinking Display

#### Phase 2: Trade System Completion
- [ ] 2.1 Trade Database Schema
- [ ] 2.2 Trade API Endpoints
- [ ] 2.3 Trade Execution UI
- [ ] 2.4 Trade History Page
- [ ] 2.5 Trade Execution Tracking
- [ ] 2.6 Trade Journal

#### Phase 3: Research Report Enhancements
- [ ] 3.1 Report Navigation
- [ ] 3.2 Data Visualization

#### Phase 4: User Productivity
- [ ] 4.1 Advanced History Filters
- [ ] 4.2 Notification System
- [ ] 4.3 Saved Watchlists

#### Phase 5: Mobile & Performance
- [ ] 5.1 Mobile-Optimized Report View
- [ ] 5.2 Progressive Web App (PWA)
- [ ] 5.3 Optimized Ticker Search
- [ ] 5.4 Virtual Scrolling for History
- [ ] 5.5 Markdown Rendering Optimization
- [ ] 5.6 Skeleton Screens

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

## Executive Summary

VeratheonResearch has strong fundamentals with real-time updates, state persistence, and a well-designed autonomous agent workflow. This plan outlines the sequential implementation of features to bring the platform to production quality.

**Key Focus Areas**:
- Complete the trade feature (currently "Coming Soon")
- Implement robust error recovery and user controls
- Enhance data presentation with visualization
- Improve user productivity with filtering and notifications
- Optimize mobile experience

**Implementation Approach**: Features are ordered for sequential implementation, with each building upon the foundation of previous work.

---

## Implementation Sequence

### Phase 1: Error Handling Foundation

These features establish the error handling infrastructure that all subsequent features will rely on.

---

#### 1.1 Toast Notification System

Replace all blocking `alert()` calls with a modern toast notification system.

**What I'll Build**:
- Non-blocking toast notifications positioned at top-right
- Four types: Success, Error, Warning, Info
- Auto-dismiss after 5 seconds (with manual dismiss option)
- Action buttons for errors (e.g., "Retry", "View Details")
- Notification queue management for multiple simultaneous toasts

**Implementation**:
- Install `svelte-sonner` library
- Create `ToastContainer.svelte` component in `src/lib/components/`
- Add container to `src/routes/+layout.svelte`
- Create `src/lib/stores/toast.ts` store for notification management
- Replace all `alert()` calls throughout codebase with toast calls
- Add toast utilities in `src/lib/utils/toast.ts`

**Files to Modify**:
- `src/routes/+layout.svelte` - Add ToastContainer
- `src/routes/+page.svelte` - Replace alert calls
- `src/lib/composables/useRealtimeResearch.ts` - Replace alert calls
- `package.json` - Add svelte-sonner dependency

**Acceptance Criteria**:
- Zero `alert()` calls remain in codebase ✅
- Users can continue working while viewing notifications ✅
- Multiple notifications stack properly ✅
- Notifications are accessible and screen-reader friendly ✅

**Status**: ✅ Completed
**Completed**: 2026-02-01
**Notes**: Successfully implemented toast notification system using svelte-sonner. All 4 alert() calls replaced with appropriate toast notifications (error, warning). Toast container added to layout with top-right positioning, rich colors, and close buttons. Created utility wrapper functions for easier usage across the application.

---

#### 1.2 Detailed Error Messages

Implement user-friendly error explanations with categorized error types.

**What I'll Build**:
- Standardized error response format from backend
- Frontend error mapping utility that translates error codes to user-friendly messages
- Error categories:
  - `RATE_LIMIT_EXCEEDED`: "Alpha Vantage rate limit reached. Try again in 1 minute."
  - `INVALID_TICKER`: "Symbol not found. Check spelling or try a different ticker."
  - `MODEL_TIMEOUT`: "Analysis took too long. Retry with a faster model."
  - `NETWORK_ERROR`: "Connection lost. Check your internet and retry."
- Error codes for support reference
- Retry-after timing information where applicable

**Implementation**:
- Backend: Update `veratheon-research/server/api.py` with standardized error responses
- Frontend: Create `src/lib/utils/errorHandler.ts` with error mapping
- Create error type definitions in `src/lib/types/errors.ts`
- Integrate with toast system for display
- Update all API calls to use error handler

**Files to Create**:
- `src/lib/utils/errorHandler.ts`
- `src/lib/types/errors.ts`

**Files to Modify**:
- `src/lib/api/research.ts` - Add error handling
- `src/routes/api/research/start/+server.ts` - Standardize error responses
- Backend `veratheon-research/server/api.py` - Standardized error format

**Acceptance Criteria**:
- All errors display user-friendly messages
- Technical details hidden from users but logged for debugging
- Error codes displayed for support reference
- Retry guidance provided where applicable

**Status**: ✅ Completed
**Completed**: 2026-02-01
**Notes**: Successfully implemented standardized error handling with user-friendly messages and error codes. Created error type definitions (src/lib/types/errors.ts) with 13 error codes including RATE_LIMIT_EXCEEDED, INVALID_TICKER, MODEL_TIMEOUT, and NETWORK_ERROR. Built error handler utility (src/lib/utils/errorHandler.ts) with parseApiError(), handleApiError(), and createApiError() functions. Updated backend (veratheon-research/server/api.py) to return standardized error responses with error codes, user messages, retry_after timing, and support codes. Updated frontend API client (src/lib/api/research.ts) and proxy endpoint (src/routes/api/research/start/+server.ts) to properly parse and forward errors. Integrated with toast notification system for user-friendly error display with retry buttons. All errors now display user-friendly messages with technical details logged to console for debugging.

---

#### 1.3 Job Retry Mechanism

Allow users to retry failed research jobs.

**What I'll Build**:
- "Retry" button component that appears on failed jobs
- Retry counter (max 3 attempts per job)
- Visual indication of retry count on job cards
- Automatic retry with exponential backoff for transient failures
- Backend endpoint to trigger job retry

**Implementation**:
- Backend: Create `POST /api/research/retry/:job_id` endpoint in FastAPI
- Database: Add `retry_count` INTEGER column to `research_jobs` table
- Frontend: Create `RetryButton.svelte` component
- Add retry button to:
  - `ResearchStatusHeader.svelte` (main page)
  - History page job cards
- Update job status display to show retry count
- Implement exponential backoff logic in backend

**Files to Create**:
- `src/lib/components/RetryButton.svelte`
- Migration: `veratheon-supabase/supabase/migrations/YYYYMMDDHHMMSS_add_retry_count.sql`

**Files to Modify**:
- Backend `veratheon-research/server/api.py` - Add retry endpoint
- `src/lib/components/ResearchStatusHeader.svelte` - Add retry button
- `src/routes/history/+page.svelte` - Add retry button to cards
- `src/lib/api/research.ts` - Add retry API call

**Acceptance Criteria**:
- Failed jobs show retry button
- Retry count displayed on job status
- Jobs can be retried up to 3 times
- Retrying a job creates a new job with reference to original
- Transient failures retry automatically

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 1.4 Job Cancellation

Allow users to cancel in-progress research jobs.

**What I'll Build**:
- "Cancel" button on running jobs
- Confirmation modal warning about partial results
- Graceful agent shutdown that saves partial progress
- Status update to "Cancelled by User"
- Backend signal mechanism to stop running agents

**Implementation**:
- Backend: Create `POST /api/research/cancel/:job_id` endpoint
- Backend: Implement flow interruption logic in `src/flows/research_flow.py`
- Database: Add `cancelled_at` TIMESTAMPTZ column to `research_jobs` table
- Frontend: Create `CancelButton.svelte` component
- Frontend: Create `CancelConfirmModal.svelte` for confirmation
- Update job status badge to show "Cancelled" state

**Files to Create**:
- `src/lib/components/CancelButton.svelte`
- `src/lib/components/CancelConfirmModal.svelte`
- Migration: `veratheon-supabase/supabase/migrations/YYYYMMDDHHMMSS_add_cancelled_at.sql`

**Files to Modify**:
- Backend `veratheon-research/server/api.py` - Add cancel endpoint
- Backend `veratheon-research/src/flows/research_flow.py` - Add cancellation handling
- `src/lib/components/ResearchStatusHeader.svelte` - Add cancel button
- `src/lib/api/research.ts` - Add cancel API call
- `src/lib/types/research-types.ts` - Add 'cancelled' status

**Acceptance Criteria**:
- Running jobs show cancel button
- Confirmation modal prevents accidental cancellation
- Cancelled jobs show "Cancelled by User" status
- Backend agents stop gracefully when cancelled
- Partial results preserved if any agents completed

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 1.5 Real-time Agent Thinking Display

Show users what each research agent is doing in real-time, similar to modern LLM "thinking" indicators.

**What I'll Build**:
- Expandable "thinking" boxes for each running agent
- Real-time status messages showing current activity:
  - "Fetching Q3 2024 earnings report from Alpha Vantage..."
  - "Analyzing revenue growth trends over last 8 quarters..."
  - "Searching recent news about AAPL..."
  - "Calculating forward P/E ratio and peer comparisons..."
  - "Synthesizing findings from quantitative and qualitative reports..."
- Typing animation effect for streaming updates
- Timestamp for each update
- Collapsible sections to manage screen space
- Auto-scroll to latest update
- Visual indicators:
  - Pulsing dot while agent is active
  - Thinking bubble icon
  - Progress bar for multi-step operations

**Implementation**:
- Backend: Stream status updates via Server-Sent Events (SSE) or WebSocket
- Backend: Update research flow to emit granular status messages
- Database: Add `agent_status_messages` table to store message history
- Frontend: Create `AgentThinkingBox.svelte` component
- Frontend: Create `ThinkingMessage.svelte` for individual messages
- Frontend: Implement SSE/WebSocket client for real-time updates
- Add to `ResearchFlowsSection.svelte` as expandable panels

**Backend Changes**:

Database Schema:
```sql
CREATE TABLE agent_status_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES research_jobs(main_job_id) NOT NULL,
  sub_job_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('info', 'progress', 'success', 'warning')) DEFAULT 'info',
  progress_percent INTEGER CHECK (progress_percent >= 0 AND progress_percent <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_status_job_id ON agent_status_messages(job_id);
CREATE INDEX idx_agent_status_created_at ON agent_status_messages(created_at DESC);
```

Backend Python (research flow updates):
```python
# In veratheon-research/src/flows/research_flow.py
async def emit_status(job_id: str, agent_name: str, message: str, progress: int = None):
    """Emit status message to database and SSE stream"""
    await supabase.table('agent_status_messages').insert({
        'job_id': job_id,
        'sub_job_id': agent_name,
        'agent_name': agent_name,
        'message': message,
        'progress_percent': progress
    }).execute()

# Usage in agents:
await emit_status(job_id, 'quantitative_agent', 'Fetching earnings data from Alpha Vantage...', 10)
await emit_status(job_id, 'quantitative_agent', 'Analyzing Q3 2024 earnings report...', 30)
await emit_status(job_id, 'quantitative_agent', 'Calculating revenue growth trends...', 50)
```

FastAPI SSE Endpoint:
```python
# In veratheon-research/server/api.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

@app.get("/research/stream/{job_id}")
async def stream_agent_status(job_id: str):
    """Stream agent status updates via Server-Sent Events"""
    async def event_stream():
        last_message_id = None

        while True:
            # Query for new messages
            response = supabase.table('agent_status_messages')\
                .select('*')\
                .eq('job_id', job_id)\
                .order('created_at', desc=False)\
                .execute()

            messages = response.data
            if last_message_id:
                messages = [m for m in messages if m['id'] > last_message_id]

            for message in messages:
                yield f"data: {json.dumps(message)}\n\n"
                last_message_id = message['id']

            # Check if job is complete
            job = supabase.table('research_jobs').select('status').eq('id', job_id).single().execute()
            if job.data['status'] in ['completed', 'failed', 'cancelled']:
                break

            await asyncio.sleep(0.5)  # Poll every 500ms

    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

**Frontend Files to Create**:
- `src/lib/components/AgentThinkingBox.svelte` - Container for thinking messages
- `src/lib/components/ThinkingMessage.svelte` - Individual status message
- `src/lib/components/TypingIndicator.svelte` - Animated typing dots
- `src/lib/utils/sseClient.ts` - Server-Sent Events client utility
- `src/routes/api/research/stream/[job_id]/+server.ts` - SSE proxy endpoint

**Frontend Files to Modify**:
- `src/lib/components/ResearchFlowsSection.svelte` - Add thinking boxes to each agent

**Component Structure**:

```svelte
<!-- AgentThinkingBox.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import ThinkingMessage from './ThinkingMessage.svelte';
  import TypingIndicator from './TypingIndicator.svelte';

  export let jobId: string;
  export let agentName: string;
  export let agentDisplayName: string;
  export let isRunning: boolean;

  let messages: AgentStatusMessage[] = [];
  let expanded = true;
  let eventSource: EventSource | null = null;
  let messagesContainer: HTMLElement;

  onMount(() => {
    // Connect to SSE stream
    eventSource = new EventSource(`/api/research/stream/${jobId}`);

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Only show messages for this agent
      if (message.agent_name === agentName) {
        messages = [...messages, message];

        // Auto-scroll to bottom
        setTimeout(() => {
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource?.close();
    };
  });

  onDestroy(() => {
    eventSource?.close();
  });
</script>

<div class="thinking-box" class:collapsed={!expanded}>
  <button
    class="thinking-header"
    on:click={() => expanded = !expanded}
  >
    <div class="agent-info">
      <div class="thinking-icon">
        {#if isRunning}
          <div class="pulsing-dot"></div>
        {:else}
          <div class="check-icon">✓</div>
        {/if}
      </div>
      <span class="agent-name">{agentDisplayName}</span>
      {#if messages.length > 0}
        <span class="message-count">{messages.length} updates</span>
      {/if}
    </div>
    <div class="expand-icon" class:rotated={!expanded}>▼</div>
  </button>

  {#if expanded}
    <div class="messages-container" bind:this={messagesContainer}>
      {#if messages.length === 0 && isRunning}
        <div class="waiting-message">
          <TypingIndicator />
          <span>Initializing...</span>
        </div>
      {:else}
        {#each messages as message}
          <ThinkingMessage {message} />
        {/each}

        {#if isRunning}
          <div class="typing-indicator">
            <TypingIndicator />
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .thinking-box {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 12px;
    background: white;
    overflow: hidden;
  }

  .thinking-header {
    width: 100%;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9fafb;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
  }

  .thinking-header:hover {
    background: #f3f4f6;
  }

  .agent-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .thinking-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulsing-dot {
    width: 12px;
    height: 12px;
    background: #3b82f6;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .agent-name {
    font-weight: 600;
    color: #1f2937;
  }

  .message-count {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .expand-icon {
    transition: transform 0.2s;
  }

  .expand-icon.rotated {
    transform: rotate(-90deg);
  }

  .messages-container {
    max-height: 400px;
    overflow-y: auto;
    padding: 12px 16px;
    background: white;
  }

  .waiting-message {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .typing-indicator {
    margin-top: 8px;
  }
</style>
```

```svelte
<!-- ThinkingMessage.svelte -->
<script lang="ts">
  export let message: AgentStatusMessage;

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
</script>

<div class="message" class:success={message.message_type === 'success'}>
  <div class="message-header">
    <span class="timestamp">{formatTime(message.created_at)}</span>
    {#if message.progress_percent !== null}
      <span class="progress">{message.progress_percent}%</span>
    {/if}
  </div>
  <div class="message-text">{message.message}</div>
  {#if message.progress_percent !== null}
    <div class="progress-bar">
      <div class="progress-fill" style="width: {message.progress_percent}%"></div>
    </div>
  {/if}
</div>

<style>
  .message {
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
    animation: slideIn 0.3s ease-out;
  }

  .message:last-child {
    border-bottom: none;
  }

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

  .message-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .timestamp {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .progress {
    font-size: 0.75rem;
    color: #3b82f6;
    font-weight: 600;
  }

  .message-text {
    font-size: 0.875rem;
    color: #374151;
    line-height: 1.5;
  }

  .message.success .message-text {
    color: #059669;
    font-weight: 500;
  }

  .progress-bar {
    margin-top: 6px;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    transition: width 0.3s ease-out;
  }
</style>
```

```svelte
<!-- TypingIndicator.svelte -->
<div class="typing-indicator">
  <span class="dot"></span>
  <span class="dot"></span>
  <span class="dot"></span>
</div>

<style>
  .typing-indicator {
    display: inline-flex;
    gap: 4px;
  }

  .dot {
    width: 6px;
    height: 6px;
    background: #9ca3af;
    border-radius: 50%;
    animation: typing 1.4s infinite;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
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
```

**Types to Add**:
```typescript
// src/lib/types/agentStatus.ts
interface AgentStatusMessage {
  id: string;
  job_id: string;
  sub_job_id: string;
  agent_name: string;
  message: string;
  message_type: 'info' | 'progress' | 'success' | 'warning';
  progress_percent?: number;
  created_at: string;
}
```

**Example Agent Status Messages**:

Quantitative Agent:
- "Fetching company overview from Alpha Vantage..."
- "Retrieved financial data for AAPL"
- "Analyzing Q3 2024 earnings report..."
- "Calculating revenue growth rate: +12.3% YoY"
- "Fetching historical earnings data (8 quarters)..."
- "Computing forward P/E ratio: 28.5x"
- "Comparing with sector average P/E: 24.1x"
- "Analysis complete ✓"

Qualitative Agent:
- "Searching for recent news about AAPL..."
- "Found 47 news articles from past 30 days"
- "Analyzing sentiment in news headlines..."
- "Sentiment score: +0.72 (positive)"
- "Searching social media mentions..."
- "Analyzed 1,234 tweets and posts"
- "Compiling qualitative summary..."
- "Research complete ✓"

Macro Agent:
- "Fetching CPI data from Federal Reserve..."
- "Current inflation rate: 3.2%"
- "Retrieving 10-year Treasury yield: 4.25%"
- "Fetching VIX (volatility index): 14.8"
- "Collecting sector ETF performance..."
- "Macro context assembled ✓"

Synthesis Agent:
- "Reviewing quantitative findings..."
- "Integrating qualitative insights..."
- "Analyzing macro economic context..."
- "Identifying key investment themes..."
- "Synthesizing comprehensive analysis..."
- "Investment thesis complete ✓"

Trade Advice Agent:
- "Evaluating entry point opportunities..."
- "Calculating risk/reward ratio: 3.2:1"
- "Determining optimal position sizing..."
- "Setting stop-loss at $175 (-5%)"
- "Setting take-profit at $205 (+16%)"
- "Trade recommendations ready ✓"

**Acceptance Criteria**:
- Each agent shows real-time status updates as it works
- Messages display with typing animation
- Progress percentages show for multi-step operations
- Messages auto-scroll to latest update
- Thinking boxes are collapsible to save space
- Works on both desktop and mobile
- SSE connection automatically reconnects on failure
- Historical messages persist (viewable after job completes)
- No performance impact on main UI
- Gracefully handles slow/missing updates

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

### Phase 2: Trade System Completion

Complete the trade feature which is currently showing "Coming Soon".

---

#### 2.1 Trade Database Schema

Create the database tables to store trade data.

**What I'll Build**:
- `trades` table with all necessary fields
- Row Level Security (RLS) policies for user isolation
- Indexes for performance
- Foreign key relationships to research jobs

**Implementation**:
- Create migration with trade schema
- Enable RLS on trades table
- Add policies: users can only access their own trades
- Create indexes on user_id, symbol, status, created_at

**Files to Create**:
- `veratheon-supabase/supabase/migrations/YYYYMMDDHHMMSS_create_trades_table.sql`

**SQL Schema**:
```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  symbol TEXT NOT NULL,
  research_job_id UUID REFERENCES research_jobs(id),
  trade_type TEXT CHECK (trade_type IN ('long', 'short', 'call', 'put')) NOT NULL,
  entry_price DECIMAL(10,2),
  quantity INTEGER,
  stop_loss DECIMAL(10,2),
  take_profit DECIMAL(10,2),
  status TEXT CHECK (status IN ('planned', 'open', 'closed')) DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  exit_price DECIMAL(10,2),
  actual_entry_price DECIMAL(10,2)
);

CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);
```

**Acceptance Criteria**:
- Trade table created successfully
- RLS policies enforce user isolation
- Can insert, update, delete trades
- Foreign key to research_jobs works

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 2.2 Trade API Endpoints

Create backend API endpoints for trade CRUD operations.

**What I'll Build**:
- `POST /api/trades` - Create new trade
- `GET /api/trades` - List user's trades with filtering
- `GET /api/trades/:id` - Get specific trade
- `PATCH /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade
- Query parameters for filtering (status, symbol, date range)

**Implementation**:
- Create `src/routes/api/trades/+server.ts` for list/create
- Create `src/routes/api/trades/[id]/+server.ts` for get/update/delete
- Add type definitions in `src/lib/types/trade.ts`
- Add API client functions in `src/lib/api/trades.ts`
- Add validation for trade data

**Files to Create**:
- `src/routes/api/trades/+server.ts`
- `src/routes/api/trades/[id]/+server.ts`
- `src/lib/types/trade.ts`
- `src/lib/api/trades.ts`

**Type Definitions**:
```typescript
interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  research_job_id?: string;
  trade_type: 'long' | 'short' | 'call' | 'put';
  entry_price?: number;
  quantity?: number;
  stop_loss?: number;
  take_profit?: number;
  status: 'planned' | 'open' | 'closed';
  notes?: string;
  created_at: string;
  executed_at?: string;
  closed_at?: string;
  exit_price?: number;
  actual_entry_price?: number;
}

interface CreateTradeRequest {
  symbol: string;
  research_job_id?: string;
  trade_type: 'long' | 'short' | 'call' | 'put';
  entry_price?: number;
  quantity?: number;
  stop_loss?: number;
  take_profit?: number;
  notes?: string;
}

interface TradeFilters {
  status?: 'planned' | 'open' | 'closed';
  symbol?: string;
  start_date?: string;
  end_date?: string;
}
```

**Acceptance Criteria**:
- All CRUD operations work correctly
- Filtering by status, symbol, date range works
- RLS enforced (users only see their trades)
- Validation prevents invalid data
- Proper error handling with standardized errors

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 2.3 Trade Execution UI

Build the modal and form for creating trade plans from research reports.

**What I'll Build**:
- Trade modal that opens from "Trade Ideas" section
- Pre-filled form with data from research report
- Trade type selector (Long, Short, Call, Put)
- Entry price input with validation
- Position size calculator (% of portfolio)
- Stop loss / take profit inputs
- Risk/reward ratio calculator
- Notes field
- Save as planned trade

**Implementation**:
- Update existing `TradeModal.svelte` to connect to API
- Update `TradeForm.svelte` with proper validation
- Create `PositionSizeCalculator.svelte` component
- Create `RiskRewardDisplay.svelte` component
- Add "Create Trade" button to Trade Ideas section
- Wire up form submission to trades API

**Files to Modify**:
- `src/lib/components/TradeModal.svelte` - Connect to API
- `src/lib/components/TradeForm.svelte` - Add validation and calculations

**Files to Create**:
- `src/lib/components/PositionSizeCalculator.svelte`
- `src/lib/components/RiskRewardDisplay.svelte`

**Features**:
- Position size calculator:
  - Input: Portfolio value, risk percentage
  - Output: Number of shares based on stop loss distance
- Risk/reward calculator:
  - Input: Entry, stop loss, take profit
  - Output: Risk/reward ratio display
- Form validation:
  - Entry price > 0
  - Quantity > 0
  - Stop loss < entry (for long) or > entry (for short)
  - Take profit > entry (for long) or < entry (for short)

**Acceptance Criteria**:
- Modal opens from Trade Ideas section
- Form pre-fills with symbol and suggested entry price
- Position size calculator works correctly
- Risk/reward ratio displays correctly
- Form validates all inputs
- Successful submission creates trade in database
- Success toast shown after creation
- Modal closes and trade appears in history

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 2.4 Trade History Page

Build the `/trades` page to display and manage trades.

**What I'll Build**:
- Replace "Coming Soon" banner with functional trade list
- Three tabs: Planned, Open, Closed
- Trade cards showing:
  - Symbol and trade type badge
  - Entry/exit prices
  - Stop loss / take profit levels
  - P&L (for closed trades)
  - Created/executed/closed dates
  - Action buttons (Execute, Close, Edit, Delete)
- Filter controls (symbol search, date range)
- Sort options (date, symbol, P&L)
- Summary statistics card:
  - Total P&L
  - Win rate
  - Average risk/reward ratio
  - Total trades by status

**Implementation**:
- Update `src/routes/trades/+page.svelte` to fetch and display trades
- Update `TradeHistory.svelte` to use real data from API
- Create `TradeCard.svelte` component for individual trade display
- Create `TradeStats.svelte` component for summary statistics
- Add filtering and sorting logic
- Add pagination for large trade lists

**Files to Modify**:
- `src/routes/trades/+page.svelte` - Remove "Coming Soon", add functionality
- `src/lib/components/TradeHistory.svelte` - Connect to API

**Files to Create**:
- `src/lib/components/TradeCard.svelte`
- `src/lib/components/TradeStats.svelte`
- `src/lib/components/TradeFilters.svelte`

**Acceptance Criteria**:
- "Coming Soon" banner removed
- All three tabs display correct trades
- Cards show all relevant trade information
- Summary stats calculate correctly
- Filtering by symbol works
- Sorting works for all columns
- Pagination handles large lists efficiently

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 2.5 Trade Execution Tracking

Add the ability to mark trades as executed and track actual fill prices.

**What I'll Build**:
- "Execute Trade" button on planned trades
- Execution modal to capture:
  - Actual fill price
  - Execution timestamp
  - Notes about execution
- Status update from "planned" to "open"
- Variance display (planned vs actual entry price)
- Position update functionality for open trades:
  - Adjust stop loss
  - Adjust take profit
  - Add notes
- Close position functionality:
  - Capture exit price
  - Calculate realized P&L
  - Status update to "closed"

**Implementation**:
- Create `ExecutionModal.svelte` component
- Create `ClosePositionModal.svelte` component
- Create `EditTradeModal.svelte` component
- Add action buttons to trade cards
- Implement P&L calculation logic
- Update trade stats to include P&L metrics

**Files to Create**:
- `src/lib/components/ExecutionModal.svelte`
- `src/lib/components/ClosePositionModal.svelte`
- `src/lib/components/EditTradeModal.svelte`
- `src/lib/utils/tradeCalculations.ts`

**P&L Calculations**:
```typescript
// Long position
const pnl = (exitPrice - entryPrice) * quantity;
const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;

// Short position
const pnl = (entryPrice - exitPrice) * quantity;
const pnlPercent = ((entryPrice - exitPrice) / entryPrice) * 100;

// Options (simplified)
const pnl = (exitPrice - entryPrice) * quantity * 100; // 100 shares per contract
```

**Acceptance Criteria**:
- Planned trades can be marked as executed
- Actual fill price captured and variance shown
- Open trades can have stops/targets adjusted
- Open trades can be closed with exit price
- P&L calculated correctly for all trade types
- Trade stats update to reflect P&L

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 2.6 Trade Journal

Add note-taking and tagging capabilities to trades.

**What I'll Build**:
- Rich text editor for trade notes
- Three note types:
  - Pre-trade: Plan and thesis
  - In-trade: Updates and adjustments
  - Post-trade: Review and lessons learned
- Tag system for categorizing trades:
  - Pre-defined tags: "swing trade", "day trade", "earnings play", "technical breakout", "fundamental value"
  - Custom tags
- Tag management interface
- Filter trades by tags
- Link to research report (auto-linked via research_job_id)
- Review mode: View past trades with notes side-by-side with outcomes

**Implementation**:
- Install TipTap or Quill for rich text editing
- Create `TradeNotes.svelte` component
- Create `TagSelector.svelte` component
- Add notes section to trade cards (expandable)
- Add tag filter to trade history
- Create trade review page at `/trades/review`

**Files to Create**:
- `src/lib/components/TradeNotes.svelte`
- `src/lib/components/TagSelector.svelte`
- `src/routes/trades/review/+page.svelte`

**Database Changes**:
- Add `tags` JSONB column to trades table (array of strings)
- Migration: `veratheon-supabase/supabase/migrations/YYYYMMDDHHMMSS_add_trade_tags.sql`

**Acceptance Criteria**:
- Notes can be added at any stage of trade lifecycle
- Rich text formatting works (bold, italic, lists)
- Tags can be added and removed
- Trades filterable by tags
- Review mode shows trades with full context
- Notes persist correctly

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

### Phase 3: Research Report Enhancements

Improve the presentation and navigation of research reports.

---

#### 3.1 Report Navigation

Add table of contents, expand/collapse controls, and jump links.

**What I'll Build**:
- Sticky table of contents sidebar (desktop)
- Collapsible TOC dropdown (mobile)
- "Expand All" / "Collapse All" buttons in header
- Jump links to each section with smooth scrolling
- Scroll progress indicator showing which section is active
- "Back to Top" floating button
- Current section highlighted in TOC

**Implementation**:
- Create `TableOfContents.svelte` component
- Add scroll tracking with Intersection Observer API
- Add smooth scroll behavior
- Update `ResearchReportDisplay.svelte` to include TOC
- Create `ScrollToTop.svelte` button component
- Add expand/collapse all controls

**Files to Create**:
- `src/lib/components/TableOfContents.svelte`
- `src/lib/components/ScrollToTop.svelte`

**Files to Modify**:
- `src/lib/components/ResearchReportDisplay.svelte` - Add TOC and controls

**Acceptance Criteria**:
- TOC shows all report sections
- Clicking TOC item scrolls to section
- Active section highlighted in TOC
- Expand all/collapse all works correctly
- Back to top button appears after scrolling
- Smooth scroll animations work
- Mobile TOC is accessible and functional

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 3.2 Data Visualization

Add charts and visual displays for key financial metrics.

**What I'll Build**:
- **Earnings Trends Chart**: Line chart showing historical EPS with projected future earnings
- **PE Ratio Timeline**: Line chart of forward PE ratio over time
- **Sentiment Gauge**: Radial gauge showing sentiment score (-100 to +100)
- **Peer Comparison**: Horizontal bar chart comparing key metrics across peer companies
- **Price Target Range**: Visual range display with current price indicator
- Toggle between "Chart View" and "Text View" for each section

**Implementation**:
- Install Chart.js or Recharts library
- Backend: Structure data for charting in JSON format
- Create chart components:
  - `EarningsChart.svelte`
  - `PERatioChart.svelte`
  - `SentimentGauge.svelte`
  - `PeerComparisonChart.svelte`
  - `PriceTargetRange.svelte`
- Add view toggle to report sections
- Update backend to include structured data alongside markdown

**Files to Create**:
- `src/lib/components/charts/EarningsChart.svelte`
- `src/lib/components/charts/PERatioChart.svelte`
- `src/lib/components/charts/SentimentGauge.svelte`
- `src/lib/components/charts/PeerComparisonChart.svelte`
- `src/lib/components/charts/PriceTargetRange.svelte`
- `src/lib/components/ViewToggle.svelte`

**Backend Changes**:
- Update `WorkflowResult` type to include chart data:
  ```python
  @dataclass
  class WorkflowResult:
      symbol: str
      quantitative_report: str | None = None
      qualitative_report: str | None = None
      macro_report: MacroReport | None = None
      synthesis_report: str | None = None
      trade_advice: str | None = None
      # New fields for charts
      earnings_data: dict | None = None  # {quarters: [...], eps: [...], projected: [...]}
      pe_ratio_data: dict | None = None  # {dates: [...], pe_ratios: [...]}
      sentiment_score: float | None = None  # -100 to 100
      peer_data: dict | None = None  # {companies: [...], metrics: {...}}
      price_target: dict | None = None  # {current: float, low: float, high: float}
      error: str | None = None
  ```

**Acceptance Criteria**:
- All charts render correctly with real data
- Charts are responsive and mobile-friendly
- View toggle switches between chart and text
- Charts accessible (proper labels, screen reader support)
- Backend provides structured data for all charts
- Fallback to text view if chart data unavailable

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

### Phase 4: User Productivity

Add features that make power users more efficient.

---

#### 4.1 Advanced History Filters

Add comprehensive filtering, sorting, and bulk actions to the history page.

**What I'll Build**:
- Search bar for symbol or company name
- Filter controls:
  - Status: Completed, Failed, Running (multi-select)
  - Date range: Last 7 days, Last 30 days, Custom range
  - Model used: Dropdown of available models
- Sort options:
  - Date (newest/oldest)
  - Symbol (A-Z, Z-A)
  - Status
- Bulk selection:
  - Checkbox on each job card
  - "Select All" checkbox
  - Bulk actions toolbar when items selected:
    - Delete selected
    - Archive selected (hide from main view)
    - Re-run selected
- Pagination: 20 items per page with page navigation
- Persistent filters in URL query params

**Implementation**:
- Create `HistoryFilters.svelte` component
- Add bulk selection state management
- Create `BulkActionsToolbar.svelte` component
- Update `/api/user-jobs` endpoint to support query parameters
- Add database indexes for performance
- Add archived flag to research_jobs table
- Implement pagination logic

**Files to Create**:
- `src/lib/components/HistoryFilters.svelte`
- `src/lib/components/BulkActionsToolbar.svelte`
- Migration: `veratheon-supabase/supabase/migrations/YYYYMMDDHHMMSS_add_archived_flag.sql`

**Files to Modify**:
- `src/routes/history/+page.svelte` - Add filters and bulk actions
- `src/routes/api/user-jobs/+server.ts` - Add query parameter support

**Database Changes**:
```sql
ALTER TABLE research_jobs ADD COLUMN archived BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_research_jobs_archived ON research_jobs(archived);
CREATE INDEX idx_research_jobs_user_symbol ON research_jobs(user_id, symbol);
```

**Acceptance Criteria**:
- Search finds jobs by symbol or company name
- All filters work correctly and can be combined
- Sorting works for all options
- Bulk selection works across pages
- Bulk delete/archive/re-run executes correctly
- Pagination loads efficiently
- URL updates with filter state (shareable links)
- Archived jobs hidden from main view (toggle to show)

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 4.2 Notification System

Build browser and email notifications for research completion.

**What I'll Build**:
- **Browser Notifications**: Native browser notifications when research completes (if tab not focused)
- **Email Notifications**: Optional email when research completes
- **In-app Notification Center**: Bell icon with unread count in navbar
- **Notification Preferences**: Settings page controls:
  - Enable/disable browser notifications
  - Enable/disable email notifications
  - Notify on: Completion only, Failure only, or Both
  - Email frequency: Instant, Daily digest
- Notification history in notification center

**Implementation**:
- Frontend: Request browser notification permission
- Create `NotificationCenter.svelte` component with dropdown
- Create notification permission prompt
- Update settings page with notification preferences
- Backend: Trigger notifications on job status change
- Backend: Use Supabase Edge Functions for email sending
- Database: Create tables:
  - `user_notification_preferences`
  - `notifications` (in-app notification history)

**Files to Create**:
- `src/lib/components/NotificationCenter.svelte`
- `src/lib/components/NotificationPermissionPrompt.svelte`
- `src/lib/utils/notifications.ts`
- Backend: `veratheon-research/supabase/functions/send-email/index.ts` (Edge Function)
- Migrations:
  - `YYYYMMDDHHMMSS_create_notification_preferences.sql`
  - `YYYYMMDDHHMMSS_create_notifications_table.sql`

**Database Schema**:
```sql
CREATE TABLE user_notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  browser_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  notify_on TEXT CHECK (notify_on IN ('completion', 'failure', 'both')) DEFAULT 'both',
  email_frequency TEXT CHECK (email_frequency IN ('instant', 'daily')) DEFAULT 'instant',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('research_complete', 'research_failed', 'trade_executed')),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);
```

**Backend Integration**:
- Add notification trigger to research flow on completion
- Check user preferences before sending
- Create email template for research completion
- Implement daily digest logic (cron job)

**Acceptance Criteria**:
- Permission prompt shows on first use
- Browser notifications work when tab unfocused
- Email notifications send correctly
- In-app notification center shows all notifications
- Unread count badge updates in real-time
- Clicking notification navigates to relevant page
- Settings page allows preference management
- Daily digest bundles multiple notifications
- Notifications respect user preferences

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 4.3 Saved Watchlists

Allow users to create and manage lists of stocks to track.

**What I'll Build**:
- Create named watchlists (e.g., "Tech Stocks", "Earnings Plays")
- Add/remove symbols from watchlists
- Watchlist page (`/watchlists`) showing all lists
- Watchlist detail view showing:
  - All symbols in list
  - Latest research status for each symbol
  - Quick research button for each symbol
  - Bulk research: "Analyze All" button
- "Add to Watchlist" button on research pages
- Watchlist management:
  - Create, rename, delete watchlists
  - Reorder symbols within list
  - Duplicate watchlist

**Implementation**:
- Database: Create tables for watchlists
- Create `/watchlists` route and page
- Create `/watchlists/[id]` route for detail view
- Create `WatchlistCard.svelte` component
- Create `WatchlistDetail.svelte` component
- Create `AddToWatchlistModal.svelte`
- Add API endpoints for watchlist CRUD

**Files to Create**:
- `src/routes/watchlists/+page.svelte`
- `src/routes/watchlists/[id]/+page.svelte`
- `src/routes/api/watchlists/+server.ts`
- `src/routes/api/watchlists/[id]/+server.ts`
- `src/routes/api/watchlists/[id]/symbols/+server.ts`
- `src/lib/components/WatchlistCard.svelte`
- `src/lib/components/WatchlistDetail.svelte`
- `src/lib/components/AddToWatchlistModal.svelte`
- `src/lib/api/watchlists.ts`
- `src/lib/types/watchlist.ts`

**Database Schema**:
```sql
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE watchlist_symbols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(watchlist_id, symbol)
);

CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX idx_watchlist_symbols_watchlist_id ON watchlist_symbols(watchlist_id);

ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_symbols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlists"
  ON watchlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watchlists"
  ON watchlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlists"
  ON watchlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlists"
  ON watchlists FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view symbols in their watchlists"
  ON watchlist_symbols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM watchlists
      WHERE watchlists.id = watchlist_symbols.watchlist_id
      AND watchlists.user_id = auth.uid()
    )
  );

-- Similar policies for INSERT, UPDATE, DELETE on watchlist_symbols
```

**Features**:
- Drag-and-drop reordering of symbols
- Quick add from ticker search
- Bulk research with progress tracking
- Show latest research date for each symbol
- Color-coded status indicators

**Acceptance Criteria**:
- Users can create unlimited watchlists
- Symbols can be added/removed easily
- Watchlist detail shows latest research for each symbol
- "Analyze All" triggers research for all symbols
- Drag-and-drop reordering works
- Add to watchlist from research page works
- Watchlists persist correctly

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

### Phase 5: Mobile & Performance

Optimize the mobile experience and improve overall performance.

---

#### 5.1 Mobile-Optimized Report View

Enhance the mobile experience for viewing research reports.

**What I'll Build**:
- **Swipe Gestures**:
  - Swipe left/right to navigate between report sections
  - Swipe down to collapse accordion
  - Visual feedback during swipe
- **Larger Touch Targets**: Minimum 44px for all interactive elements
- **Bottom Navigation Bar**: Quick jump buttons for mobile
- **Floating Action Button (FAB)**: Context-aware actions
- **Auto-Collapse**: Only one section expanded at a time on mobile
- **Mobile-Optimized Typography**: Improved readability

**Implementation**:
- Install `svelte-gestures` library for swipe detection
- Create mobile-specific components:
  - `MobileBottomNav.svelte`
  - `FloatingActionButton.svelte`
- Add mobile detection utility
- Add swipe handlers to report sections
- Implement auto-collapse logic for mobile
- Update typography scales for mobile

**Files to Create**:
- `src/lib/components/mobile/MobileBottomNav.svelte`
- `src/lib/components/mobile/FloatingActionButton.svelte`
- `src/lib/utils/deviceDetection.ts`

**Files to Modify**:
- `src/lib/components/ResearchReportDisplay.svelte` - Add mobile optimizations
- `src/app.css` - Mobile typography adjustments

**CSS Changes**:
```css
/* Mobile touch targets */
@media (max-width: 768px) {
  button, a {
    min-height: 44px;
    min-width: 44px;
  }

  /* Mobile typography */
  .report-section h2 {
    font-size: 1.5rem;
  }

  .report-section p {
    font-size: 1rem;
    line-height: 1.6;
  }
}
```

**Acceptance Criteria**:
- Swipe gestures work smoothly
- All touch targets meet 44px minimum
- Bottom nav appears on mobile, hidden on desktop
- FAB shows relevant actions based on context
- Only one report section open at a time on mobile
- Typography readable on all mobile devices
- No horizontal scrolling on mobile

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 5.2 Progressive Web App (PWA)

Make the app installable and add offline support.

**What I'll Build**:
- Installable on mobile home screen
- Offline support for cached reports
- Service worker for faster loads
- Splash screen with brand logo
- Standalone app mode (no browser chrome)
- Update notifications when new version available

**Implementation**:
- Install `vite-plugin-pwa` to SvelteKit
- Create `manifest.json` with app metadata
- Design app icons (192x192, 512x512)
- Create splash screen assets
- Configure service worker caching strategy:
  - Cache-first for static assets
  - Network-first for API calls
  - Stale-while-revalidate for research reports
- Add offline page
- Add update notification

**Files to Create**:
- `static/manifest.json`
- `static/icons/` directory with app icons
- `src/service-worker.ts`
- `src/routes/offline/+page.svelte`
- `src/lib/components/UpdateNotification.svelte`

**Configuration**:
```javascript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'VeratheonResearch',
        short_name: 'Veratheon',
        description: 'AI-powered stock market research platform',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-cache'
            }
          }
        ]
      }
    })
  ]
});
```

**Acceptance Criteria**:
- App installable on iOS and Android
- Install prompt appears for eligible users
- App launches in standalone mode when installed
- Offline page shows when no connection
- Recently viewed reports accessible offline
- Service worker caches static assets
- Update notification prompts when new version available
- App icon and splash screen display correctly

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 5.3 Optimized Ticker Search

Improve the ticker search experience on mobile.

**What I'll Build**:
- Larger search input on mobile (full width)
- Search results as full-screen modal on mobile
- Recent searches saved in localStorage
- Popular symbols quick-pick chips
- Clear search history button

**Implementation**:
- Create `TickerSearchMobile.svelte` component
- Add localStorage for recent searches (max 10)
- Backend: Create `GET /api/ticker-search/popular` endpoint
- Add quick-pick chip UI
- Implement search history management

**Files to Create**:
- `src/lib/components/mobile/TickerSearchMobile.svelte`
- `src/lib/stores/searchHistory.ts`
- `src/routes/api/ticker-search/popular/+server.ts`

**Files to Modify**:
- `src/lib/components/TickerSearch.svelte` - Add mobile variant

**localStorage Schema**:
```typescript
interface SearchHistory {
  searches: Array<{
    symbol: string;
    name: string;
    timestamp: string;
  }>;
}
```

**Popular Symbols Backend**:
```python
# Query most researched symbols in last 30 days
SELECT symbol, COUNT(*) as research_count
FROM research_jobs
WHERE created_at > NOW() - INTERVAL '30 days'
  AND status = 'completed'
GROUP BY symbol
ORDER BY research_count DESC
LIMIT 10;
```

**Acceptance Criteria**:
- Search input full-width on mobile
- Results display as full-screen modal on mobile
- Recent searches show on search focus
- Popular symbols display as chips
- Clicking recent/popular search triggers research
- Search history persists across sessions
- Clear history button works
- Mobile search UX significantly faster than desktop

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 5.4 Virtual Scrolling for History

Optimize history page performance for users with many jobs.

**What I'll Build**:
- Virtual scrolling for job list (only render visible items)
- Infinite scroll pagination
- Performance optimization for 100+ jobs

**Implementation**:
- Install `svelte-virtual` library
- Update history page to use virtual list
- Implement infinite scroll with intersection observer
- Backend pagination: 20 items per page

**Files to Modify**:
- `src/routes/history/+page.svelte` - Add virtual scrolling

**Files to Create**:
- `src/lib/components/VirtualJobList.svelte`

**Implementation Example**:
```svelte
<script>
  import { VirtualList } from 'svelte-virtual';

  let jobs = [];
  let hasMore = true;

  async function loadMore() {
    // Fetch next page
  }
</script>

<VirtualList
  items={jobs}
  let:item
  height="calc(100vh - 200px)"
>
  <JobCard job={item} />
</VirtualList>

{#if hasMore}
  <div use:intersect on:intersect={loadMore}>
    Loading...
  </div>
{/if}
```

**Acceptance Criteria**:
- History page loads instantly even with 500+ jobs
- Only visible items rendered in DOM
- Infinite scroll loads next page automatically
- Scroll position maintained during updates
- Smooth scrolling performance
- Memory usage optimized

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 5.5 Markdown Rendering Optimization

Optimize markdown parsing to prevent unnecessary re-renders.

**What I'll Build**:
- Memoized markdown parsing with Svelte stores
- Only re-render on content change (not accordion toggle)
- Lazy render collapsed sections

**Implementation**:
- Create markdown cache store
- Update report display to use cached rendering
- Implement lazy rendering for collapsed sections

**Files to Create**:
- `src/lib/stores/markdownCache.ts`

**Files to Modify**:
- `src/lib/components/ResearchReportDisplay.svelte`
- `src/lib/utils/markdown.ts`

**Implementation**:
```typescript
// markdownCache.ts
import { writable, derived } from 'svelte/store';
import { renderMarkdown } from '$lib/utils/markdown';

interface MarkdownCache {
  [key: string]: string;
}

export const markdownCache = writable<MarkdownCache>({});

export function getCachedMarkdown(content: string, key: string) {
  return derived(markdownCache, ($cache) => {
    if (!$cache[key]) {
      const rendered = renderMarkdown(content);
      markdownCache.update(cache => ({
        ...cache,
        [key]: rendered
      }));
      return rendered;
    }
    return $cache[key];
  });
}
```

**Lazy Rendering**:
```svelte
<script>
  let expanded = false;
  let rendered = '';

  $: if (expanded && !rendered) {
    rendered = renderMarkdown(content);
  }
</script>

<div class="accordion">
  <button on:click={() => expanded = !expanded}>
    {title}
  </button>
  {#if expanded}
    <div>{@html rendered}</div>
  {/if}
</div>
```

**Acceptance Criteria**:
- Markdown only parsed once per content change
- Accordion toggle doesn't trigger re-parse
- Collapsed sections not rendered until expanded
- CPU usage reduced during accordion interactions
- Report page feels snappier

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

#### 5.6 Skeleton Screens

Add skeleton loaders to improve perceived load times.

**What I'll Build**:
- Skeleton loaders for:
  - History page loading
  - Report sections loading
  - Ticker search results loading
  - Trade list loading
- Shimmer animation effect
- Match layout of actual content

**Implementation**:
- Create reusable skeleton components
- Add CSS shimmer animation
- Replace loading spinners with skeletons

**Files to Create**:
- `src/lib/components/skeletons/SkeletonJobCard.svelte`
- `src/lib/components/skeletons/SkeletonReportSection.svelte`
- `src/lib/components/skeletons/SkeletonSearchResult.svelte`
- `src/lib/components/skeletons/SkeletonTradeCard.svelte`

**Shimmer CSS**:
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-text {
  height: 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-text:last-child {
  width: 60%;
}
```

**Acceptance Criteria**:
- Skeletons match layout of real content
- Shimmer animation smooth and subtle
- Loading states feel faster (perceived performance)
- No layout shift when content loads
- Skeletons accessible (ARIA labels)

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

## Success Metrics

After implementation, success will be measured by:

### User Engagement
- **Daily Active Users (DAU)**: Target +50% growth
- **Session Duration**: Target +30% increase
- **Research Completion Rate**: Target >85%
- **Return User Rate**: Target >60% within 7 days

### Feature Adoption
- **Trade Feature Usage**: >60% of research leads to trade plan
- **Notification Enablement**: >50% of users enable alerts
- **Watchlist Usage**: >30% of users create watchlists
- **Mobile Usage**: >40% of sessions on mobile devices

### Quality Metrics
- **Error Rate**: <2% of research jobs fail
- **Retry Success Rate**: >70% of retried jobs complete
- **Page Load Time**: <1s for home, <2s for reports
- **Support Ticket Volume**: -50% reduction

**Status**: ⬜ Not Started
**Completed**: [Date]
**Notes**: [Implementation notes, challenges, deviations from plan]

---

## Technical Debt

During implementation, I'll address these technical debt items:

1. **Type Safety**: Strengthen TypeScript types for API responses (done incrementally)
2. **Polling Reduction**: Optimize Realtime fallback with longer intervals and backoff
3. **Empty States**: Add placeholders for all data-dependent components
4. **Alert Removal**: Eliminate all `alert()` calls (completed in Phase 1)
5. **Markdown Caching**: Prevent re-parsing on accordion toggle (Phase 5)
6. **History Pagination**: Add server-side pagination for scalability (Phase 4)

---

## Implementation Notes

**Sequential Approach**: Each feature builds on previous work. Dependencies are ordered correctly.

**Testing Strategy**: After each major feature, I'll:
- Test functionality manually
- Verify mobile responsiveness
- Check error handling
- Ensure accessibility
- Test with real data

**Code Quality**: Throughout implementation:
- Follow SvelteKit conventions
- Maintain TypeScript strict mode
- Write clean, documented code
- Use consistent naming conventions
- Keep components focused and reusable

**Database Migrations**: All schema changes versioned and reversible.

**API Consistency**: All endpoints follow RESTful conventions with standardized error responses.

---

**Ready to implement**: This plan provides a clear, sequential roadmap for building VeratheonResearch into a production-ready stock analysis platform.
