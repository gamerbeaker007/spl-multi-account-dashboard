# Refresh System Explained - SIMPLIFIED

## How It Works (Simple Version)

### 1. The Trigger (UsernameContext)
Located in: `src/contexts/UsernameContext.tsx`

```typescript
const [refreshTrigger, setRefreshTrigger] = useState(0);

const triggerRefreshAll = () => {
  setRefreshTrigger(prev => prev + 1); // Increments: 0 → 1 → 2 → 3...
};
```

**What happens:**
- `refreshTrigger` starts at `0`
- When you click "Refresh All" button → `triggerRefreshAll()` is called
- `refreshTrigger` increases by 1 (e.g., 0 → 1)
- All components watching this number will react

---

### 2. The Button (UsernameManager)
Located in: `src/components/UsernameManager.tsx`

```typescript
const { triggerRefreshAll } = useUsernameContext();

<Button onClick={triggerRefreshAll}>
  Refresh All
</Button>
```

**What happens:**
- User clicks button → `triggerRefreshAll()` is called
- This increments the `refreshTrigger` number

---

### 3. The Watchers (Components that refresh)

#### A. PlayerCard
Located in: `src/components/PlayerCard.tsx`

```typescript
const { refreshTrigger } = useUsernameContext();
const { refetch } = usePlayerStatus(username);

useEffect(() => {
  if (refreshTrigger > 0) {
    refetch(); // Fetch player status data
  }
}, [refreshTrigger, refetch]);
```

**What happens:**
- Watches `refreshTrigger` number
- When it changes (e.g., 0 → 1), runs `refetch()`
- Fetches: player balances, draws, leaderboard data

---

#### B. CardCollection
Located in: `src/components/CardCollection.tsx`

```typescript
const { refreshTrigger } = useUsernameContext();
const { refetch } = usePlayerCardCollection(username);

useEffect(() => {
  if (refreshTrigger > 0) {
    refetch(); // Fetch card collection data
  }
}, [refreshTrigger, refetch]);
```

**What happens:**
- Watches `refreshTrigger` number
- When it changes, runs `refetch()`
- Fetches: card collection, collection power, market values

---

#### C. PlayerDailies
Located in: `src/components/PlayerDailies.tsx`

```typescript
const { refreshTrigger } = useUsernameContext();
const { fetchDailyProgress } = useDailyProgress(username);

useEffect(() => {
  if (refreshTrigger > 0) {
    fetchDailyProgress(); // Fetch daily quest progress
  }
}, [refreshTrigger, fetchDailyProgress]);
```

**What happens:**
- Watches `refreshTrigger` number
- When it changes, runs `fetchDailyProgress()`
- Fetches: daily quest progress (wild, modern, foundation)

---

## The Flow (Step by Step)

```
1. User clicks "Refresh All" button
   ↓
2. triggerRefreshAll() is called
   ↓
3. refreshTrigger increases: 0 → 1
   ↓
4. All components watching refreshTrigger see the change
   ↓
5. Each component refetches its data:
   - PlayerCard → refetch() → player status
   - CardCollection → refetch() → card collection
   - PlayerDailies → fetchDailyProgress() → daily quests
   ↓
6. Fresh data is displayed!
```

---

## Why This Works

**The Pattern:**
1. **Shared State**: All components share the same `refreshTrigger` number from context
2. **Change Detection**: React's `useEffect` detects when the number changes
3. **Action**: When detected, each component calls its own fetch function

**Key Points:**
- ✅ All components refresh at the same time
- ✅ Only need to increment one number
- ✅ Components are independent (don't know about each other)
- ✅ Easy to add new components (just watch `refreshTrigger`)

---

## To Add a New Component to Refresh System

1. Import the context:
   ```typescript
   import { useUsernameContext } from '@/contexts/UsernameContext';
   ```

2. Get the trigger:
   ```typescript
   const { refreshTrigger } = useUsernameContext();
   ```

3. Watch for changes:
   ```typescript
   useEffect(() => {
     if (refreshTrigger > 0) {
       myFetchFunction(); // Your fetch function here
     }
   }, [refreshTrigger, myFetchFunction]);
   ```

Done! Your component will now refresh when "Refresh All" is clicked.

---

## Alternative: Per-User Refresh

If you want to refresh just ONE specific user (not all):

```typescript
const { triggerRefreshUser } = useUsernameContext();

// Trigger refresh for specific user
triggerRefreshUser('beaker007');
```

This uses `userRefreshTriggers` which is a map:
```typescript
{
  'beaker007': 1,
  'player2': 0,
  'player3': 2
}
```

Each username has its own counter. When you call `triggerRefreshUser('beaker007')`, only that username's counter increases, and only components for that user will refresh.
