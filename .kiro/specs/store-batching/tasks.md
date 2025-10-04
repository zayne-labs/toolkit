# Implementation Plan

- [x] 1. Update type definitions for batching support
  - Add `BatchedUpdate<TState>` type for batched updates
  - Extend `SetState<TState>` type to include `batched` method
  - Update `StoreApi<TState>` interface to reflect new setState signature
  - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.4_

- [ ] 2. Implement core batching mechanism in createStore
  - [x] 2.1 Add batch queue and scheduling flag state variables
    - Initialize `batchQueue` array to store pending updates
    - Initialize `isBatchScheduled` boolean flag for guard clause
    - _Requirements: 1.2, 2.1_

  - [x] 2.2 Implement the batched method with guard clause
    - Create `batched` function that queues updates
    - Implement guard clause to prevent multiple microtask schedules
    - Schedule microtask on first call and set scheduling flag
    - _Requirements: 1.2, 2.1, 2.2, 2.3_

  - [x] 2.3 Implement flush logic in microtask callback
    - Reset scheduling flag when microtask executes
    - Capture and clear the batch queue
    - Apply all queued updates in order with proper merging
    - Call underlying setState with final merged state
    - _Requirements: 1.3, 1.4, 1.5, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

  - [x] 2.4 Attach batched method to setState
    - Add `batched` property to setState function
    - Ensure proper TypeScript typing for the attachment
    - _Requirements: 1.1, 6.1_

- [ ] 3. Write unit tests for basic batching functionality
  - Test multiple synchronous batched calls result in single listener notification
  - Test final state reflects all updates in correct order
  - Test queue is cleared after flush
  - Test guard clause prevents multiple microtask schedules
  - _Requirements: 1.3, 1.4, 1.5, 2.1, 2.2, 2.4_

- [x] 4. Write unit tests for update merging logic
  - Test object updates merge correctly
  - Test function updates receive correct accumulated state
  - Test mixed object and function updates work together
  - Test update order is preserved
  - Test equality check prevents unnecessary notifications
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Write unit tests for async boundary handling
  - Test updates before await are batched together
  - Test updates after await form new batch
  - Test each batch results in single notification
  - Test async function completion flushes pending batch
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Write unit tests for backward compatibility
  - Test regular setState works immediately without batching
  - Test getState returns current state during batch cycle
  - Test subscribe works with batched updates
  - Test resetState works independently of batching
  - Test no performance overhead when batching not used
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 7. Write type safety tests
  - Create test cases that verify TypeScript inference
  - Test partial state updates for object states
  - Test full state requirement for primitive states
  - Test function parameter typing
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 8. Write integration tests for real-world scenarios
  - Test form updates with multiple fields
  - Test async data fetching with loading states
  - Test rapid state changes (simulating user interactions)
  - Test interleaved batched and non-batched calls
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 5.1_
