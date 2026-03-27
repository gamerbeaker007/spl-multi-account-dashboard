# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Development server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Prettier format
npm run format:all    # Format + lint fix + type check (npx tsc --noEmit)
```

Set `DEBUG_LOGS=true` to enable verbose server-side logging during development.

## Architecture Overview

Multi-account Splinterlands game dashboard built with **Next.js 16 App Router**, **React 19**, **Material-UI v7**, and **TypeScript (strict mode)**.

### Data Flow

```
UsernameContext (global state)
  ├── Username list + ordering (persisted to localStorage)
  ├── Per-user authentication tokens
  └── Refresh trigger system (sequential queue to avoid rate limits)

PlayerStatusDashboard (orchestrator)
  └── PlayerCard × N (per account)
      ├── Custom hooks fetch data (usePlayerStatus, usePlayerCardCollection, etc.)
      └── Display components render it (PlayerBalances, PlayerDraws, PlayerDailies, etc.)
```

### Key Files

| File | Role |
|------|------|
| `src/lib/api/splApi.ts` | Centralized Splinterlands API client (~900 lines). All API calls go here. Axios with retry-axios: 10 retries, exponential backoff, 429/5xx handling. |
| `src/lib/actions/` | Next.js server actions — call splApi methods and aggregate data for hooks. |
| `src/hooks/` | Custom hooks that invoke server actions and manage component-level state. |
| `src/contexts/UsernameContext.tsx` | Global state for usernames, auth tokens, and the refresh queue. |
| `src/lib/log/logger.server.ts` | Server-side logger. Use `logger.info/debug/error()` for all API operations. |

### Refresh Queue System

"Refresh All" triggers a **sequential** refresh of players (not concurrent) to avoid rate limits. The queue is managed in `UsernameContext`:
- `refreshQueue` — ordered list of players pending refresh
- `activeRefreshUser` — currently refreshing player
- `advanceRefreshQueue()` — called after a player's status + collection both finish loading
- Each `PlayerCard` watches `userRefreshTriggers[username]` via `useEffect` to know when to refetch

### Authentication

Hive blockchain signing via `keychain-sdk`. JWT tokens are encrypted and stored in context. Private API endpoints (history, dailies, balance history) require a Bearer token passed through server actions.

### Adding a New API Integration

1. Add typed response interface in `src/types/spl/`
2. Add fetch function to `src/lib/api/splApi.ts` using `splBaseClient`
3. Add server action in `src/lib/actions/`
4. Add or extend a hook in `src/hooks/`

### Conventions

- All imports use `@/` path alias (maps to `src/`)
- API responses must be validated even on 200: check `!data || !Array.isArray(data)` as appropriate
- Log all API operations (start, success, failure) including `username` context
- Splinterlands API dates are ISO strings — convert to `Date` objects as needed
- Drag-and-drop reordering of player cards uses `dnd-kit`
