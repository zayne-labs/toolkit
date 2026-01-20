# Batching Behavior Explained

This document describes how state updates are grouped to optimize performance. By default, state updates happen immediately, but notifications to listeners are delayed until the current code finished running.

## Overview

Normally, calling `setState` several times in a row would notify listeners every single time. This is often unnecessary when you're making multiple related updates.

```typescript
store.setState({ count: 1 }); // Would notify
store.setState({ count: 2 }); // Would notify
store.setState({ count: 3 }); // Would notify
// Result: 3 notifications for what is effectively one change.
```

With batching, these updates are grouped together. A single notification is sent after all synchronous code has finished.

```typescript
store.setState({ count: 1 });
store.setState({ count: 2 });
store.setState({ count: 3 });
// Code finishes running...
await flushMicrotasks();
// Result: 1 notification with the final state: { count: 3 }.
```

---

## Core Concepts

### State vs. Notifications

State updates are always immediate. If you call `getState()` right after `setState()`, you will get the new value. Only the **notification** to listeners is delayed.

```typescript
store.setState({ count: 1 });
console.log(store.getState().count); // 1 (Happens immediately)

// Listeners haven't been called yet.
await flushMicrotasks();
// Listeners are called now.
```

### Microtasks

The system uses `queueMicrotask()` to schedule notifications. This ensures they run after the current function finishes, but before the browser moves on to the next task (like rendering or handling events).

### The Batch Manager

The `BatchManager` keeps track of the batch state using these properties:

```typescript
type BatchManagerState<TState> = {
	isCancelled: boolean; // Tells the microtask to skip notifying
	previousStateSnapshot: TState; // The state as it was before the batch started
	status: "active" | "idle"; // Whether a notification is already scheduled
};
```

---

## How Batching Works

### Step-by-Step Flow

**First setState:**

```typescript
store.setState({ count: 1 });
```

1. Updates `currentState = { count: 1 }`.
2. Calls `batchManager.actions.schedule()`.
3. Checks `status === "active"`? No, it's `"idle"`.
4. Sets `status = "active"` (starting a batch).
5. Saves `previousStateSnapshot = { count: 0 }` (the state BEFORE this update).
6. Schedules a microtask to notify listeners later.

**Second setState:**

```typescript
store.setState({ count: 2 });
```

1. Updates `currentState = { count: 2 }`.
2. Calls `batchManager.actions.schedule()`.
3. Checks `status === "active"`? Yes!
4. Returns early without scheduling another microtask.
5. `previousStateSnapshot` remains `{ count: 0 }` (unchanged).

**Third setState:**

```typescript
store.setState({ count: 3 });
```

1. Updates `currentState = { count: 3 }`.
2. Calls `batchManager.actions.schedule()`.
3. Checks `status === "active"`? Yes!
4. Returns early.
5. `previousStateSnapshot` remains `{ count: 0 }` (unchanged).

**Microtask Executes:**

1. Sets `status = "idle"` (batch is done).
2. Checks `isCancelled`? No.
3. Calls `onRunningBatch(previousStateSnapshot)`:
   - Compares `currentState` ({ count: 3 }) with `previousStateSnapshot` ({ count: 0 }).
   - Since they are different, it notifies listeners with the final state `{ count: 3 }` and the original state `{ count: 0 }`.

**Result**: Listeners are called exactly once with `({ count: 3 }, { count: 0 })`.

---

## Preserving the "Before" State

### Why Snapshots Matter

Without saving the state at the start of the batch, the "previous state" sent to listeners would only show the most recent change, rather than the state before the whole set of updates began.

```typescript
// Initial state: { count: 0 }
store.setState({ count: 1 });
// Snapshot saved: { count: 0 }

store.setState({ count: 2 });
// Snapshot stays: { count: 0 }

// When the batch finished:
// Listeners receive: (current: 2, previous: 0)
```

Initializing the snapshot to the store's `initialState` ensures that notifications triggered early (like during plugin setup or hydration) always have a valid reference point.

### The Equality Check

The system performs a final check before notifying:

```typescript
onRunningBatch: (previousStateSnapshot) => {
	if (equalityFn(currentState, previousStateSnapshot)) return;

	notifyListeners(currentState, previousStateSnapshot);
};
```

This prevents notifications if a series of updates results in no net change (e.g., updating a value to `1` and then back to `0` in the same batch).

---

## Immediate Notifications

Sometimes updates need to skip batching and notify listeners immediately using `shouldNotifySync`.

### How Cancellation Works

If an immediate update is requested while a batch is already waiting:

1. The `isCancelled` flag is set to `true`.
2. Listeners are notified right away with the current state.
3. When the original scheduled microtask finally runs, it sees the `isCancelled` flag and cleans up without notifying listeners a second time.

---

## Fundamental Rules

### One Microtask at a Time

The `"active"` status acts as a guard. Only one microtask can be scheduled for a batch.

### Metadata Cleanup

The scheduled microtask is always responsible for resetting the batch state (`status` and `isCancelled`), even if it was cancelled. This keeps the manager ready for the next batch.

### Snapshot Timing

The `previousStateSnapshot` is only set when moving from `"idle"` to `"active"`. It must not be updated during the batch, or the "original state" context would be lost.

---

## Common Implementation Errors

### ❌ Cancelling When No Batch Exists

Setting the `isCancelled` flag when there is no active batch can cause the _next_ legitimate batch to be skipped.

```typescript
function setState(newState: unknown) {
	if (shouldNotifySync) {
		batchManager.actions.cancel(); // Mistake: Flag is set even if idle
		onNotifySync();
	}
}
```

### ❌ Overwriting the Snapshot

Updating the snapshot outside of the initial "idle" check will give listeners incorrect information about what changed.

```typescript
function setState(newState: unknown) {
	batchManager.actions.setPreviousStateSnapshot(previousState); // Mistake: Happens on every call

	if (batchManager.state.status === "active") return;

	console.log("This code is properly guarded");
}
```

---

## Summary

- **State updates are immediate; notifications are grouped.**
- **The system ensures only one notification task is scheduled at a time.**
- **A snapshot preserves the state from the start of the batch.**
- **Immediate updates cancel pending notifications to avoid duplicates.**
- **Equality checks are used at the end to skip unnecessary notifications.**
