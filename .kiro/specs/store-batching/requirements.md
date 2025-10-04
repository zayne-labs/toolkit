# Requirements Document

## Introduction

This feature adds batching support to the `createStore` API, allowing multiple state updates to be grouped together and applied in a single operation. This reduces unnecessary re-renders and improves performance when multiple state changes occur in quick succession, particularly in synchronous code blocks and across async boundaries.

The batching mechanism uses a microtask queue to defer and batch updates, ensuring that all synchronous updates within the same execution context are combined into one state change notification to listeners.

## Requirements

### Requirement 1: Basic Batching API

**User Story:** As a developer using the store, I want to batch multiple state updates together, so that my listeners are only notified once instead of multiple times.

#### Acceptance Criteria

1. WHEN the store is created THEN it SHALL provide a `batched` method on the `setState` function
2. WHEN `setState.batched()` is called with a state update THEN the update SHALL be queued instead of applied immediately
3. WHEN multiple `setState.batched()` calls occur synchronously THEN all updates SHALL be collected into a single queue
4. WHEN the current execution context completes THEN all queued updates SHALL be applied in a single state change
5. WHEN batched updates are applied THEN listeners SHALL be notified only once with the final merged state

### Requirement 2: Guard Clause for Microtask Scheduling

**User Story:** As a developer, I want the batching system to efficiently handle multiple batched calls, so that only one microtask is scheduled per batch cycle.

#### Acceptance Criteria

1. WHEN the first `setState.batched()` call occurs THEN a microtask SHALL be scheduled to flush the queue
2. WHEN subsequent `setState.batched()` calls occur before the microtask runs THEN no additional microtasks SHALL be scheduled
3. WHEN the scheduled microtask executes THEN the scheduling flag SHALL be reset to allow future batches
4. WHEN the queue is flushed THEN the queue SHALL be cleared for the next batch cycle

### Requirement 3: Update Merging Logic

**User Story:** As a developer, I want batched updates to merge correctly, so that both object updates and function updates work as expected.

#### Acceptance Criteria

1. WHEN a batched update is an object THEN it SHALL be merged with the accumulated state
2. WHEN a batched update is a function THEN it SHALL be called with the current accumulated state and return the next state
3. WHEN multiple updates are queued THEN they SHALL be applied in the order they were queued
4. WHEN the final merged state is computed THEN it SHALL be passed to the underlying `setState` function
5. IF the final merged state equals the current state (via equality check) THEN listeners SHALL NOT be notified

### Requirement 4: Async Boundary Handling

**User Story:** As a developer working with async code, I want batching to work correctly across await boundaries, so that updates before and after an await are batched separately.

#### Acceptance Criteria

1. WHEN `setState.batched()` calls occur before an await THEN they SHALL be batched together
2. WHEN an await boundary is crossed THEN the pending batch SHALL be flushed before the await completes
3. WHEN `setState.batched()` calls occur after an await THEN they SHALL form a new batch
4. WHEN an async function completes THEN any pending batched updates SHALL be flushed

### Requirement 5: Compatibility with Existing API

**User Story:** As a developer with existing code using the store, I want the batching feature to be opt-in, so that my existing code continues to work without changes.

#### Acceptance Criteria

1. WHEN `setState()` is called without `.batched` THEN it SHALL behave exactly as before (immediate update)
2. WHEN `getState()` is called during a batch cycle THEN it SHALL return the current state (not the pending batched state)
3. WHEN `subscribe()` is used THEN it SHALL work with both batched and non-batched updates
4. WHEN `resetState()` is called THEN it SHALL work independently of any pending batches
5. IF batching is not used THEN there SHALL be no performance overhead or behavior changes

### Requirement 6: Type Safety

**User Story:** As a TypeScript developer, I want full type safety for the batching API, so that I get proper autocomplete and type checking.

#### Acceptance Criteria

1. WHEN using `setState.batched()` THEN TypeScript SHALL infer the correct state type
2. WHEN passing a function to `setState.batched()` THEN the function parameter SHALL be typed as the current state
3. WHEN passing an object to `setState.batched()` THEN it SHALL accept partial state updates (if state is an object)
4. WHEN the state type is not an object THEN `setState.batched()` SHALL require the full state type
