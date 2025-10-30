# Batching Behavior Explained

## The Problem We're Solving

Without batching, every `setState` call immediately notifies all listeners:

```typescript
store.setState({ count: 1 }); // Notifies listeners
store.setState({ count: 2 }); // Notifies listeners
store.setState({ count: 3 }); // Notifies listeners
// Result: 3 notifications, listeners see count: 1, then 2, then 3
```

This is inefficient. With batching, we delay notifications:

```typescript
store.setState({ count: 1 });
store.setState({ count: 2 });
store.setState({ count: 3 });
// All synchronous code runs first...
await flushMicrotasks();
// Result: 1 notification, listeners see count: 3 (final state)
```

---

## Core Concepts

### State vs Notifications

**Key Insight**: State updates immediately, but notifications are batched.

```typescript
store.setState({ count: 1 });
console.log(store.getState()); // { count: 1 } - State updated immediately!

store.setState({ count: 2 });
console.log(store.getState()); // { count: 2 } - State updated immediately!

// But listeners haven't been called yet - they're batched!
await flushMicrotasks();
// Now listeners are called once with final state: { count: 2 }
```

### Microtasks

JavaScript's microtask queue runs after synchronous code but before the next task. We use `queueMicrotask()` to schedule notifications:

```typescript
console.log("1. Synchronous");
queueMicrotask(() => console.log("3. Microtask"));
console.log("2. Synchronous");
// Output: 1, 2, 3
```

### The Batch Manager

Tracks batching state:

```typescript
type BatchManagerState = {
	isCancelled: boolean; // Should the microtask be cancelled?
	previousStateSnapshot: TState; // State before the batch started
	status: "idle" | "pending"; // Is a microtask scheduled?
};
```

---

## How Batching Works

### Step-by-Step Flow

**First setState:**

```typescript
store.setState({ count: 1 });
```

1. Updates `currentState = { count: 1 }`
2. Checks `status === "pending"`? No, it's "idle"
3. Sets `status = "pending"` (starting a batch)
4. Saves `previousStateSnapshot = { count: 0 }` (the state BEFORE this update)
5. Schedules a microtask to notify listeners later

**Second setState:**

```typescript
store.setState({ count: 2 });
```

1. Updates `currentState = { count: 2 }`
2. Checks `status === "pending"`? Yes!
3. Returns early - doesn't schedule another microtask
4. `previousStateSnapshot` stays `{ count: 0 }` (unchanged)

**Third setState:**

```typescript
store.setState({ count: 3 });
```

1. Updates `currentState = { count: 3 }`
2. Checks `status === "pending"`? Yes!
3. Returns early
4. `previousStateSnapshot` stays `{ count: 0 }` (unchanged)

**Microtask Executes:**

1. Sets `status = "idle"` (batch is done)
2. Checks `isCancelled`? No
3. Notifies all listeners with:
   - New state: `currentState = { count: 3 }`
   - Old state: `previousStateSnapshot = { count: 0 }`

**Result**: Listeners called once with `({ count: 3 }, { count: 0 })`

---

## Why We Need previousStateSnapshot

### The Problem

Without saving the original state, we lose it:

```typescript
// First setState
store.setState({ count: 1 });
// currentState = { count: 1 }
// previousState = { count: 0 } (local variable in this function call)
// Schedule microtask

// Second setState (before microtask fires)
store.setState({ count: 2 });
// currentState = { count: 2 }
// previousState = { count: 1 } (NEW local variable, the old one is gone!)

// Microtask fires
// We want to notify: (newState: 2, oldState: 0)
// But we only have: currentState = 2
// The original state (0) was in a local variable that's gone! 💥
```

### The Solution

Save `previousStateSnapshot` when the batch starts:

```typescript
// First setState
store.setState({ count: 1 });
// currentState = { count: 1 }
// previousStateSnapshot = { count: 0 } ← Saved!
// Schedule microtask

// Second setState
store.setState({ count: 2 });
// currentState = { count: 2 }
// previousStateSnapshot = { count: 0 } ← Still preserved!

// Microtask fires
notifyListeners(currentState, previousStateSnapshot);
// Listeners receive ({ count: 2 }, { count: 0 }) ✅
```

### Why Initialize to initialState?

The `previousStateSnapshot` is initialized to `initialState` when the store is created. This prevents undefined errors:

```typescript
const batchManager = createBatchManager({ initialState });
// previousStateSnapshot = initialState (e.g., { count: 0 })

// First setState
store.setState({ count: 1 });
// previousStateSnapshot is already set to initialState
// So listeners receive ({ count: 1 }, { count: 0 }) ✅
// Not ({ count: 1 }, undefined) ❌
```

This is critical for the persist plugin, which may trigger notifications before the state is fully hydrated.

### Why Not Snapshot currentState?

We use `currentState` directly because we WANT the latest value:

```typescript
store.setState({ count: 1 });
// currentState = { count: 1 }
// Schedule microtask

store.setState({ count: 2 });
// currentState = { count: 2 }

// Microtask fires
notifyListeners(currentState, previousStateSnapshot);
// Listeners receive ({ count: 2 }, { count: 0 }) ✅
// This is correct! We want the latest state!
```

During a batch, `currentState` is only updated by `setState` calls, which are part of the same batch. The microtask should use the latest value.

---

## Immediate Notifications (shouldNotifySync)

Sometimes you want to notify immediately, bypassing batching:

```typescript
store.setState({ count: 1 }, { shouldNotifySync: true });
// Listeners notified immediately!
```

### How Cancellation Works

**Scenario: Batch in progress, then immediate notification**

```typescript
// Step 1: Start a batch
store.setState({ count: 1 });
// status = "pending", microtask scheduled

// Step 2: Another batched update
store.setState({ count: 2 });
// status = "pending", just updates state

// Step 3: Immediate notification
store.setState({ count: 10 }, { shouldNotifySync: true });
```

What happens in Step 3:

1. Updates `currentState = { count: 10 }`
2. Checks `shouldNotifySync === true`
3. Checks `status === "pending"`? Yes!
4. Calls `cancel()` - sets `isCancelled = true` (status stays "pending")
5. Notifies listeners immediately with `({ count: 10 }, { count: 2 })`
6. Returns (doesn't schedule new microtask)

**When the old microtask fires:**

1. Sets `status = "idle"`
2. Checks `isCancelled`? Yes!
3. Calls `resetCancel()` - resets flag
4. Returns early - doesn't notify (already notified immediately)

**Result**: Only 1 notification (the immediate one), the batched notification was cancelled.

---

## The Critical Rules

### Rule 1: Only One Microtask Per Batch

The `status === "pending"` check prevents multiple microtasks:

```typescript
function setState(newState: any) {
	if (batchManager.state.status === "pending") return; // Guard clause

	batchManager.actions.start(); // Sets status = "pending"
	queueMicrotask(() => {
		/* ... */
	});
}
```

Without this guard, every `setState` would schedule a microtask = chaos!

### Rule 2: The Microtask Owns the "Pending" Status

When a microtask is scheduled, it "owns" the pending status until it completes:

```typescript
queueMicrotask(() => {
	batchManager.actions.end(); // Sets status = "idle"
	// ... notify listeners or handle cancellation
});
```

Even if cancelled, the microtask must clean up its own status. This prevents race conditions.

### Rule 3: previousStateSnapshot is Set Once Per Batch

Only set when a batch starts, not on every setState:

```typescript
function setState(newState: any) {
	if (batchManager.state.status === "pending") return; // Exit early for subsequent calls

	// Only runs on first setState in the batch
	batchManager.actions.setPreviousStateSnapshot(previousState);
}
```

### Rule 4: Cancel Only If Batch Exists

```typescript
function setState(newState: any, options: any) {
	if (options?.shouldNotifySync) {
		// Only cancel if there's actually a pending batch
		if (batchManager.state.status === "pending") {
			batchManager.actions.cancel();
		}
		notifyListeners(currentState, previousState);
	}
}
```

If we always called `cancel()`, it would set `isCancelled = true` even when no batch exists, breaking future batches.

---

## Common Scenarios

### Scenario 1: Simple Batch

```typescript
store.setState({ count: 1 }); // Schedules microtask, status = "pending"
store.setState({ count: 2 }); // Updates state, returns early
store.setState({ count: 3 }); // Updates state, returns early
await flushMicrotasks(); // Microtask fires, notifies once
```

### Scenario 2: Cancellation

```typescript
store.setState({ count: 1 }); // Schedules microtask A, status = "pending"
store.setState({ count: 2 }); // Updates state, returns early
store.setState({ count: 10 }, { shouldNotifySync: true }); // Cancels, notifies immediately
// Microtask A still pending...
await flushMicrotasks(); // Microtask A fires, sees cancellation, cleans up
```

### Scenario 3: Multiple Batches

```typescript
store.setState({ count: 1 }); // Batch 1 starts
await flushMicrotasks(); // Batch 1 completes, status = "idle"

store.setState({ count: 2 }); // Batch 2 starts (status was "idle")
await flushMicrotasks(); // Batch 2 completes
```

### Scenario 4: Immediate After Immediate

```typescript
store.setState({ count: 1 }, { shouldNotifySync: true }); // No batch, notifies immediately
store.setState({ count: 2 }, { shouldNotifySync: true }); // No batch, notifies immediately
store.setState({ count: 3 }); // Starts new batch normally
await flushMicrotasks(); // Batch completes
```

---

## State Machine

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────┐  setState (first)   ┌─────────┐             │
│  │ IDLE │ ──────────────────→  │ PENDING │             │
│  └──────┘                      └─────────┘             │
│     ↑                               │                   │
│     │                               │                   │
│     │  Microtask completes          │ setState (more)   │
│     │  (or cancelled)               │ (just updates)    │
│     │                               │                   │
│     └───────────────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Common Mistakes

### ❌ Mistake 1: Calling cancel() without checking status

```typescript
if (shouldNotifySync) {
	batchManager.actions.cancel(); // Wrong! Sets isCancelled even if no batch
	notifyListeners(currentState, previousState);
}
```

**Problem**: If no batch exists, `isCancelled` is set to true, breaking the next batch.

**Fix**: Only cancel if batch exists:

```typescript
if (shouldNotifySync && batchManager.state.status === "pending") {
	batchManager.actions.cancel();
}
```

### ❌ Mistake 2: Updating previousStateSnapshot on every call

```typescript
batchManager.actions.setPreviousStateSnapshot(previousState); // Wrong!

// eslint-disable-next-line unicorn/prefer-module, no-useless-return -- ignore
if (batchManager.state.status === "pending") return;
```

**Problem**: Overwrites the original state, listeners get wrong previous state.

**Fix**: Only set when starting a new batch:

```typescript
function setState(newState: any) {
	if (batchManager.state.status === "pending") return;
	batchManager.actions.setPreviousStateSnapshot(previousState); // Correct!
}
```

### ❌ Mistake 3: Calling end() in cancel()

```typescript
cancel: () => {
	batchManager.state.isCancelled = true;
	batchManager.actions.end(); // Wrong! Microtask still scheduled
};
```

**Problem**: Status becomes "idle" while microtask is still scheduled, allowing a second microtask to be scheduled.

**Fix**: Let the microtask clean up:

```typescript
cancel: () => {
	batchManager.state.isCancelled = true; // Just set the flag
};
```

---

## Key Takeaways

1. **State updates immediately, notifications are batched**
   - `getState()` always returns current state
   - Listeners are called once per batch with the final state

2. **One microtask per batch**
   - The `status === "pending"` guard prevents multiple microtasks
   - Each microtask "owns" the pending status until it completes

3. **previousStateSnapshot preserves the original state**
   - Initialized to `initialState` to prevent undefined errors
   - Set once when a batch starts
   - Never changes during the batch

4. **currentState is used directly (no snapshot needed)**
   - Updates immediately on every setState
   - Microtask uses the latest value

5. **Cancellation is cooperative**
   - `cancel()` sets a flag, doesn't stop the microtask
   - The microtask checks the flag and cleans up

6. **Each microtask owns the "pending" status and is responsible for cleaning it up**
