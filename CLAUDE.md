# CLAUDE.md - Veratheon UI Frontend

This file provides guidance to Claude Code (claude.ai/code) when working with the Veratheon Research frontend application.

## Overview

**Veratheon UI** is the SvelteKit frontend for the Veratheon Research platform. It provides a user interface for autonomous stock market research powered by AI agents, displaying comprehensive analysis reports combining quantitative, qualitative, and macroeconomic data.

## Tech Stack

- **Framework**: SvelteKit 2.x with Svelte 5.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x with DaisyUI 5.x component library
- **Testing**: Vitest (unit tests) + Playwright (e2e tests)
- **Database**: Supabase (authentication, job tracking, Realtime)
- **Markdown**: Marked library for report rendering

## Common Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:5173)

# Production
npm run build           # Build for production
npm run preview         # Preview production build

# Testing and Quality
npm run test            # Run all tests
npm run test:unit       # Run unit tests only
npm run lint            # Run linter
npm run format          # Format code
npm run check           # Svelte type checking
```

## Architecture

### Autonomous Research Workflow

The frontend connects to a backend API that runs a three-pillar autonomous research workflow:

```
                    User submits stock symbol (e.g., "AAPL")
                                   │
                                   ▼
                    POST /research → Backend starts job
                                   │
          ┌────────────────────────┼────────────────────┐
          │                        │                    │
          ▼                        ▼                    ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│  QUANTITATIVE     │   │  QUALITATIVE      │   │  MACRO ECONOMIC   │
│  AGENT            │   │  AGENT            │   │  REPORT           │
│                   │   │                   │   │                   │
│  • Financial data │   │  • News search    │   │  • CPI, inflation │
│  • Earnings       │   │  • Social media   │   │  • Interest rates │
│  • Valuation      │   │  • Sentiment      │   │  • VIX, GDP       │
└───────────────────┘   └───────────────────┘   └───────────────────┘
          │                        │                    │
          └────────────────────────┼────────────────────┘
                                   │
                                   ▼
                    ┌───────────────────────────┐
                    │   SYNTHESIS AGENT         │
                    │   Combines all reports    │
                    └───────────────────────────┘
                                   │
                                   ▼
                    ┌───────────────────────────┐
                    │   TRADE ADVICE AGENT      │
                    │   Actionable ideas        │
                    └───────────────────────────┘
                                   │
                                   ▼
                    Frontend displays WorkflowResult
                    (5 sections: synthesis, trade advice,
                     quantitative, qualitative, macro)
```

### Real-time Updates

The frontend uses **Supabase Realtime** to receive live updates as the backend processes the research job:

1. User submits stock symbol
2. Backend creates main job + 5 sub-jobs (one per agent)
3. Frontend subscribes to Supabase `research_jobs` table for that `main_job_id`
4. As each agent completes, frontend receives update and shows progress
5. When all agents complete, final `WorkflowResult` is displayed

**Fallback**: If Realtime fails, the frontend automatically falls back to polling the `/api/research/status/{symbol}` endpoint.

## Project Structure

```
src/
├── routes/                          # SvelteKit routes
│   ├── +page.svelte                 # Main research interface
│   ├── +layout.svelte               # App layout and navigation
│   ├── api/                         # API endpoint proxies
│   │   ├── research/
│   │   │   ├── start/+server.ts     # POST /research proxy
│   │   │   ├── status/[symbol]/+server.ts
│   │   │   └── report-status/[symbol]/+server.ts
│   │   └── status-updates/+server.ts
│   ├── login/+page.svelte           # Authentication
│   ├── trades/+page.svelte          # Trade tracking
│   ├── history/+page.svelte         # Research history
│   └── settings/+page.svelte        # User settings
│
├── lib/
│   ├── components/                  # Reusable Svelte components
│   │   ├── ResearchInputCard.svelte
│   │   ├── ResearchStatusHeader.svelte
│   │   ├── ResearchFlowsSection.svelte
│   │   ├── ResearchReportDisplay.svelte  # Main report UI
│   │   └── ...
│   │
│   ├── api/
│   │   └── research.ts              # API client functions
│   │
│   ├── composables/
│   │   └── useRealtimeResearch.ts   # Realtime subscription logic
│   │
│   ├── stores/                      # Svelte stores
│   │   └── ...
│   │
│   ├── types/
│   │   └── ...
│   │
│   ├── utils/
│   │   └── markdown.ts              # Markdown rendering
│   │
│   ├── research-types.ts            # TypeScript type definitions
│   └── supabase.ts                  # Supabase client setup
│
└── app.html                         # HTML template
```

## Backend API Contract

### Base URL
- **Development**: `http://localhost:8085` (configured in proxy endpoints)
- **Production**: Set via environment variable

### Endpoints

#### `POST /research`
Start a new autonomous research job.

**Request**:
```json
{
  "symbol": "AAPL"
}
```

**Response**:
```json
{
  "job_id": "uuid-string",
  "status": "pending",
  "message": "Research job started for AAPL"
}
```

#### `GET /jobs/{job_id}`
Get full job status by job ID.

**Response**:
```json
{
  "job_id": "uuid",
  "symbol": "AAPL",
  "status": "completed",
  "created_at": "2026-01-30T...",
  "completed_at": "2026-01-30T...",
  "result": {
    "symbol": "AAPL",
    "quantitative_report": "# Financial Analysis\n...",
    "qualitative_report": "# News & Sentiment\n...",
    "macro_report": { ... },
    "synthesis_report": "# Investment Analysis\n...",
    "trade_advice": "# Trade Ideas\n..."
  },
  "steps": [ ... ]
}
```

#### `GET /jobs/symbol/{symbol}`
Get most recent job for a symbol.

**Response**: Same as `/jobs/{job_id}`

#### `GET /report-status/{symbol}`
Check if a completed report exists for a symbol.

**Response**:
```json
{
  "has_report": true,
  "completed_at": "2026-01-30T...",
  "symbol": "AAPL",
  "job_id": "uuid"
}
```

#### `GET /ticker-search?query=app`
Search for stock ticker symbols.

**Response**:
```json
{
  "results": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "type": "Equity",
      "region": "United States"
    }
  ]
}
```

## Data Types

### WorkflowResult

The main result structure returned by the backend:

```typescript
interface WorkflowResult {
  symbol: string;
  quantitative_report: string | null;     // Markdown: financial analysis
  qualitative_report: string | null;      // Markdown: news/sentiment
  macro_report: MacroReport | null;       // Structured economic data
  synthesis_report: string | null;        // Markdown: combined analysis
  trade_advice: string | null;            // Markdown: trade ideas (advisory)
  error?: string | null;
}
```

### MacroReport

Economic indicator data (not markdown, structured data):

```typescript
interface MacroReport {
  generated_at: string;
  inflation: {
    cpi?: EconomicIndicator;
    inflation_rate?: EconomicIndicator;
  };
  employment: {
    unemployment_rate?: EconomicIndicator;
    nonfarm_payroll?: EconomicIndicator;
  };
  interest_rates: {
    fed_funds_rate?: EconomicIndicator;
    treasury_10y?: EconomicIndicator;
    treasury_2y?: EconomicIndicator;
  };
  growth: {
    real_gdp?: EconomicIndicator;
  };
  market: {
    vix?: MarketIndicator;
    sp500?: MarketIndicator;
    sector_etf?: MarketIndicator;
  };
}
```

### Job Tracking

Jobs are tracked with main jobs and sub-jobs:

```typescript
interface JobStatus {
  job_id?: string;           // Main job ID
  symbol?: string;
  status?: string;           // 'pending' | 'running' | 'completed' | 'failed'
  result?: WorkflowResult;
  error?: string;
  steps?: JobStep[];
}

interface SubJob {
  id: number;
  job_name: string;          // Agent name (e.g., 'quantitative_agent')
  status: string;            // 'pending' | 'running' | 'completed' | 'failed'
  sub_job_id: string;
  created_at: string;
  updated_at: string;
}
```

**5 Research Agents** (in order):
1. `quantitative_agent` - Financial health analysis
2. `qualitative_agent` - News and sentiment research
3. `macro_report` - Economic indicators (no LLM, data fetch only)
4. `synthesis_agent` - Combines all three reports
5. `trade_advice_agent` - Trade recommendations (advisory only)

## Key Components

### ResearchReportDisplay.svelte

Main component for displaying the `WorkflowResult`. Uses a collapsible accordion layout with 5 sections:

1. **Synthesis Report** (expanded by default) - Combined investment analysis
2. **Trade Ideas** (advisory only) - Trade recommendations with disclaimers
3. **Quantitative Analysis** - Financial metrics and earnings
4. **Qualitative Research** - News, sentiment, social media
5. **Macro Economic** - Formatted economic indicators

Each section renders markdown content using the `renderMarkdown()` utility.

### ResearchFlowsSection.svelte

Displays progress through the 5 research agents with status indicators. Uses `AGENT_DISPLAY_NAMES` mapping to show user-friendly labels:

```typescript
const AGENT_DISPLAY_NAMES: Record<string, string> = {
  'quantitative_agent': 'Quantitative Analysis',
  'qualitative_agent': 'Qualitative Research',
  'macro_report': 'Macro Economic',
  'synthesis_agent': 'Synthesis',
  'trade_advice_agent': 'Trade Ideas'
};
```

### useRealtimeResearch.ts

Composable for managing Supabase Realtime subscriptions with automatic reconnection and polling fallback. Handles:
- Subscribing to `research_jobs` table for `main_job_id`
- Receiving updates for main job and sub-jobs
- Automatic reconnection on connection loss
- Fallback to polling if Realtime unavailable
- Cleanup on component unmount

## Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321        # Local Supabase URL
VITE_SUPABASE_ANON_KEY=your_anon_key            # From `supabase status`

# Backend API (optional, defaults to localhost:8085)
VITE_API_BASE_URL=http://localhost:8085
```

**Note**: All environment variables accessed in browser code must be prefixed with `VITE_`.

## Development Guidelines

### SvelteKit Conventions

- Follow SvelteKit 2.x file-based routing
- Use `+page.svelte` for page components
- Use `+server.ts` for API endpoints
- Use `+layout.svelte` for shared layouts

### TypeScript

- All types defined in `src/lib/research-types.ts`
- Types must match backend Python dataclasses
- Use strict TypeScript checking

### Styling

- Use Tailwind CSS utility classes
- Use DaisyUI components (buttons, cards, badges, etc.)
- Follow existing color scheme (primary, secondary, accent, warning)
- Ensure mobile responsiveness

### State Management

- Use Svelte stores for global state
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`) for local state
- Use composables (like `useRealtimeResearch`) for reusable logic

### API Integration

- All backend API calls proxied through `/src/routes/api/` endpoints
- Use `src/lib/api/research.ts` client functions
- Handle errors gracefully with user-friendly messages
- Show loading states during async operations

### Realtime Updates

- Always use Supabase Realtime for job tracking when available
- Implement polling fallback for reliability
- Clean up subscriptions on component unmount
- Handle reconnection gracefully

## Testing

### Unit Tests (Vitest)

Run unit tests with:
```bash
npm run test:unit
```

Component tests use Svelte testing utilities.

### E2E Tests (Playwright)

Run e2e tests with:
```bash
npm run test
```

## Common Pitfalls

- **VITE_ prefix required**: Environment variables must start with `VITE_` to be accessible in browser
- **Realtime subscription cleanup**: Always unsubscribe from Realtime channels on component unmount
- **Markdown rendering**: Use `renderMarkdown()` utility for XSS protection
- **WorkflowResult structure**: All report fields can be `null` - handle gracefully
- **Agent count**: `TOTAL_RESEARCH_STEPS` must match backend (currently 5 agents)
- **Sub-job names**: Use exact agent names from backend (`quantitative_agent`, not `Quantitative Analysis`)
- **Trade advice disclaimers**: Always show advisory disclaimers for trade recommendations

## Deployment

The frontend can be deployed to any platform supporting Node.js:

- **Vercel** (recommended for SvelteKit)
- **Netlify**
- **Docker** (via `veratheon-infra` repository)

Set environment variables in your deployment platform:
- `VITE_SUPABASE_URL`: Production Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Production Supabase anon key
- `VITE_API_BASE_URL`: Production backend API URL

## Related Repositories

- **veratheon-research**: Python backend (FastAPI + autonomous agents)
- **veratheon-supabase**: Database schema and migrations
- **veratheon-infra**: Docker Compose orchestration

---

*Last Updated: 2026-01-31*
