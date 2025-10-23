# Copilot Instructions: SPL Multi-Account Dashboard

## Project Overview
This is a Next.js 16 application for managing multiple Splinterlands game accounts, built with TypeScript and Material-UI. The app fetches account data (balances, draws) from the Splinterlands API for dashboard-style monitoring across multiple player accounts.

## Architecture & Key Components

### Core Structure
- **Next.js 16 App Router**: Uses `src/app/` directory structure with React 19 and React Compiler enabled
- **API Layer**: `src/lib/api/splApi.ts` - Centralized Splinterlands API client with retry logic
- **Types**: `src/types/spl/` - Strongly typed interfaces for Splinterlands data structures
- **Logging**: `src/lib/log/logger.server.ts` - Custom server-side logger with development debug support

### Splinterlands Integration
The app interfaces with three main Splinterlands endpoints:
- `/players/balances` - Token balances per player
- `/ranked_draws/status` - Ranked draw participation and claims
- `/frontier_draws/status` - Frontier draw participation and claims

## Development Patterns & Conventions

### API Client Pattern
All Splinterlands API calls go through the centralized `splBaseClient` in `src/lib/api/splApi.ts`:
```typescript
// Use the configured client with retry logic and proper headers
const res = await splBaseClient.get(url, { params });
```

### Error Handling
- Always validate API responses even with 200 status: `!data || !Array.isArray(data)`
- Use the logger for all API operations: `logger.info()`, `logger.error()`
- Throw errors up for Next.js error boundaries to handle

### Type Safety
- Import types from `@/types/spl/` using the `@/` alias
- All Splinterlands API responses are strictly typed (e.g., `SplBalance[]`, `SplRankedDrawStatus[]`)
- Date fields from API are strings, convert as needed

### Logging
- Use `logger.debug()` for development-only logs (requires `DEBUG_LOGS=true`)
- Always log API operation start/success/failure
- Include context in error messages (username, operation type)

## Development Workflow

### Running the App
```bash
npm run dev          # Development server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint with Next.js config
```

### Key Dependencies
- **axios + retry-axios**: API client with exponential backoff retry (10 retries, rate limit handling)
- **Material-UI v7**: UI components with Emotion styling
- **TypeScript**: Strict mode enabled with ES2017 target

### Environment Setup
- Set `DEBUG_LOGS=true` for development logging
- No API keys needed - Splinterlands API is public
- Uses Geist fonts loaded via `next/font/google`

## Code Organization

### File Placement Rules
- **API routes**: `src/app/api/*/route.ts` (currently has empty status route)
- **Splinterlands API calls**: Add to `src/lib/api/splApi.ts`
- **Type definitions**: `src/types/spl/*.ts` (organized by feature)
- **Server utilities**: `src/lib/` (logging, utilities)
- **Components**: `src/app/` (following App Router conventions)

### Import Patterns
```typescript
// Use @ alias for src imports
import { SplBalance } from "@/types/spl/balances";
import logger from "@/lib/log/logger.server";

// Material-UI imports
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
```

## Critical Implementation Notes

### API Rate Limiting
The Splinterlands API has rate limits - the client is configured for aggressive retry with exponential backoff:
- 10 retry attempts
- Handles 429 (rate limit) and 5xx errors
- 1-second base delay with exponential backoff

### Multi-Account Context
- All API functions expect a `username` parameter
- Design UI components to handle multiple usernames/accounts
- Consider batch operations and concurrent API calls for efficiency

### Data Structures
- **Balances**: Player token holdings with last update timestamps
- **Draws**: Current and unclaimed draw status with entry counts and pass details
- **Dates**: API returns ISO strings, convert to Date objects as needed

### Styling Approach
- Uses CSS Modules (`*.module.css`) alongside Material-UI
- Dark/light mode support via CSS custom properties
- Geist font family configured in layout