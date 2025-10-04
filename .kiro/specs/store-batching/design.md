# Design Document: Store Batching Support

## Overview

This design adds a batching mechanism to the `createStore` API that allows multiple state updates to be queued and applied as a single atomic operation. The implementation uses JavaScript's microtask queue to defer updates until the current execution context completes, ensuring optimal performance without breaking existing behavior.

The batching feature is exposed as a `batched` method on the `setState` function, making it opt-in and backward compatible with existing code.

## Architecture

### High-Level Flow

```
setState.batched(update1) → Queue update1, schedule microtask (if not scheduled)
setState.batched(update2) → Queue update2, guard returns early
setState.batched(update3) → Queue update3, guard returns early
                          ↓
                    Microtask executes
                          ↓
              Apply all updates in order
                          ↓
              Call setState once with merged result
                          ↓
              Notify listeners once
```

### Key Components

1. **Update Queue**: Array that accumulates pending state updates
2. **Scheduling Flag**: Boolean guard to prevent multiple microtask schedules
3. **Batched Method**: Extension of setState that queues updates
4. **Flush Logic**: Microtask callback that processes and applies queued updates

## Components and Interfaces

### Type Definitions

```typescript
// Batched update can be partial state or updater function
type BatchedUpdate<TState> =
  | Partial<TState>
  | StoreStateSetter<TState, Partial<TState>>;

// Extended SetState type with batched method
type SetStateWithBatching<TState> = SetState<TState> & {
  batched: (update: BatchedUpdate<TState>) => void;
};

// Updated StoreApi to reflect batched setState
type StoreApi<TState> = {
  // ... existing properties
  setState: SetStateWithBatching<TState>;
};
```

### Internal State

The `createStore` function will maintain two additional pieces of state:

```typescript
let batchQueue: Array<BatchedUpdate<TState>> = [];
let isBatchScheduled = false;
```

### Batched Method Implementation

```typescript
const batched = (update: BatchedUpdate<TState>) => {
  // Add update to queue
  batchQueue.push(update);

  // Guard: If microtask already scheduled, we're done
  if (isBatchScheduled) return;

  // Schedule the flush
  isBatchScheduled = true;
  queueMicrotask(() => {
    // Reset flag for next batch cycle
    isBatchScheduled = false;

    // Capture and clear queue
    const updates = batchQueue;
    batchQueue = [];

    // Apply all updates as a single setState call
    setState((currentState) => {
      let nextState = currentState;

      for (const update of updates) {
        nextState = isFunction(update)
          ? { ...nextState, ...update(nextState) }
          : { ...nextState, ...update };
      }

      return nextState;
    });
  });
};

// Attach to setState
setState.batched = batched;
```

## Data Models

### Update Queue Entry

Each entry in `batchQueue` is either:
- A partial state object: `Partial<TState>`
- An updater function: `(state: TState) => Partial<TState>`

### State Flow

```
Current State (before batch)
       ↓
Apply update1 → Intermediate State 1
       ↓
Apply update2 → Intermediate State 2
       ↓
Apply update3 → Final State
       ↓
Pass to setState → Equality check → Notify listeners (if changed)
```

## Error Handling

### Updater Function Errors

If an updater function throws during batch processing:
- The error will propagate and stop the batch
- Already processed updates in the batch will be lost
- The queue will be cleared (preventing partial application)
- Subsequent batches will work normally

**Mitigation**: Document that updater functions should not throw. Consider wrapping in try-catch if needed.

### Type Safety

TypeScript will enforce:
- Correct state types for updates
- Proper function signatures for updaters
- No mixing of incompatible state shapes

### Edge Cases

1. **Empty Queue**: If queue is empty when microtask runs (shouldn't happen), no setState call is made
2. **Non-Object State**: For primitive states, batching still works but merging behavior differs
3. **Nested Batching**: Calling `setState.batched` from within a listener will start a new batch cycle

## Testing Strategy

### Unit Tests

1. **Basic Batching**
   - Multiple synchronous `setState.batched` calls result in single listener notification
   - Final state reflects all updates applied in order
   - Queue is cleared after flush

2. **Guard Clause**
   - Only one microtask is scheduled per batch cycle
   - Subsequent calls don't schedule additional microtasks
   - Flag resets after flush

3. **Update Merging**
   - Object updates merge correctly
   - Function updates receive correct state
   - Mixed object and function updates work together
   - Order of updates is preserved

4. **Async Boundaries**
   - Updates before await are batched together
   - Updates after await form new batch
   - Each batch results in one render

5. **Compatibility**
   - Regular `setState` still works immediately
   - `getState` returns current state during batch
   - `subscribe` works with batched updates
   - `resetState` works independently

6. **Type Safety**
   - TypeScript correctly infers types
   - Invalid updates are caught at compile time
   - Partial updates work for object states

### Integration Tests

1. **Real-World Scenarios**
   - Form updates with multiple fields
   - Async data fetching with loading states
   - Rapid user interactions (e.g., slider dragging)

2. **Performance**
   - Verify reduced listener calls
   - Measure overhead of batching mechanism
   - Compare with non-batched performance

### Edge Case Tests

1. Empty state updates
2. Identical consecutive updates
3. Updates that result in same state (equality check)
4. Very large batch queues
5. Interleaved batched and non-batched calls

## Implementation Notes

### Microtask vs setTimeout

Using `queueMicrotask` instead of `setTimeout`:
- Microtasks run before the next event loop iteration
- Faster than setTimeout (no minimum delay)
- Runs after current synchronous code but before rendering
- Perfect for batching within same execution context

### Memory Considerations

- Queue is cleared after each flush (no memory leak)
- Listeners Set is reused (no allocation per batch)
- Minimal overhead when batching is not used

### Performance Characteristics

- **Time Complexity**: O(n) where n is number of updates in batch
- **Space Complexity**: O(n) for queue storage
- **Overhead**: One microtask schedule per batch cycle
- **Benefit**: Reduces listener notifications from n to 1

### Alternative Approaches Considered

1. **Immediate Batching Window**: Use a fixed time window (e.g., 16ms)
   - Rejected: Adds unnecessary delay for synchronous updates

2. **Manual Batch API**: Require explicit `batch(() => { ... })` wrapper
   - Rejected: Less ergonomic, requires wrapping code blocks

3. **Automatic Batching**: Batch all setState calls automatically
   - Rejected: Breaking change, removes control from developers

### Integration Points

The batching feature integrates with:
- `setState`: Batched updates eventually call regular setState
- `subscribe`: Listeners receive batched updates normally
- `equalityFn`: Applied to final merged state
- `getState`: Returns current state (not pending batched state)

No changes needed to:
- `getInitialState`
- `resetState`
- `subscribe.withSelector`

## Migration Path

For existing users:
1. No breaking changes - all existing code works as-is
2. Opt-in by using `setState.batched()` instead of `setState()`
3. Can mix batched and non-batched calls in same codebase
4. Gradual adoption possible (update hot paths first)

## Future Enhancements

Potential future additions (out of scope for this feature):
1. `flushBatch()` method to manually trigger flush
2. Batch priority levels
3. Batch size limits with automatic flushing
4. DevTools integration to visualize batches
5. Batch analytics/metrics
