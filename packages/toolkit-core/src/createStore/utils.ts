type BatchManagerState<TState> = {
	isCancelled: boolean;
	previousStateSnapshot: TState;
	status: "idle" | "pending";
};

/**
 * @description Manages batching state for store updates.
 *
 * ## Key Concepts:
 *
 * 1. **status**: Tracks whether a microtask is scheduled
 *    - "idle": No microtask scheduled, next setState will schedule one
 *    - "pending": Microtask already scheduled, subsequent setStates just update snapshots
 *
 * 2. **isCancelled**: Flag to abort a scheduled microtask
 *    - Set to true when shouldNotifySync is used (immediate notification)
 *    - Prevents the queued microtask from notifying listeners again
 *
 * 3. **Snapshots**: Capture state at specific moments
 *    - previousStateSnapshot: State BEFORE the batch started (set once per batch)
 *    - currentStateSnapshot: Latest state (updated on every setState in the batch)
 *
 * ## Action Responsibilities:
 *
 * - cancel(): Marks the current batch as cancelled (sets flag only, doesn't change status)
 *   Used when shouldNotifySync interrupts a batch to notify immediately
 *
 * - resetCancel(): Cleans up after a cancelled batch (resets flag AND sets status to idle)
 *   Called by the cancelled microtask to allow new batches to start
 *
 * - end(): Sets status to idle (called by microtask after notifying listeners)
 *
 * - start(): Sets status to pending (called when scheduling a new microtask)
 *
 * ## Why cancel() and resetCancel() are separate:
 *
 * When shouldNotifySync is used during a batch:
 * 1. cancel() is called immediately (sets isCancelled flag)
 * 2. Listeners are notified synchronously
 * 3. The old microtask is still queued and will eventually fire
 * 4. When it fires, it sees isCancelled=true and calls resetCancel()
 * 5. resetCancel() cleans up (resets flag + sets status to idle)
 * 6. New setState calls can now start fresh batches
 *
 * If cancel() also set status to "idle", there would be a race condition:
 * - New setState between cancel() and microtask firing would start a new batch
 * - Old microtask fires and calls resetCancel() which would interfere with the new batch
 */
export const createBatchManager = <TState>(options: { initialState: TState }) => {
	const { initialState } = options;

	const batchManager = {
		state: {
			isCancelled: false,
			previousStateSnapshot: initialState,
			status: "idle",
		} satisfies BatchManagerState<TState> as BatchManagerState<TState>,

		// eslint-disable-next-line perfectionist/sort-objects -- I want state to come first
		actions: {
			/**
			 * @description Marks the current batch as cancelled without changing status.
			 * The queued microtask will see this flag and clean up properly.
			 */
			cancel: () => {
				batchManager.state.isCancelled = true;
			},

			/**
			 *  @description Sets status to idle, allowing new batches to be scheduled.
			 */
			end: () => {
				batchManager.state.status = "idle";
			},

			/**
			 * @description Resets the cancelled flag and sets status to idle.
			 * Called by the cancelled microtask to clean up and allow new batches.
			 */
			resetCancel: () => {
				batchManager.state.isCancelled = false;
			},

			/**
			 * @description Sets the previous state snapshot.
			 * Called ONCE when a batch starts to capture the state before any updates.
			 */
			setPreviousStateSnapshot: (prevState: TState) => {
				batchManager.state.previousStateSnapshot = prevState;
			},

			/**
			 * @description Sets status to pending, indicating a microtask is scheduled.
			 */
			start: () => {
				batchManager.state.status = "pending";
			},
		},
	};

	return batchManager;
};
