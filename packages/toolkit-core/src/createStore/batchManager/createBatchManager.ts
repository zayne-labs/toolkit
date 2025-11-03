type BatchManagerState<TState> = {
	isCancelled: boolean;
	previousStateSnapshot: TState;
	status: "idle" | "pending";
};

/**
 *@description Manages batching state for store updates.
 *
 * State:
 * - status: "idle" | "pending" - Whether a microtask is scheduled
 * - isCancelled: Flag to abort a scheduled microtask (for shouldNotifySync)
 * - previousStateSnapshot: State before the batch started (initialized to prevent undefined)
 *
 * Actions:
 * - cancel(): Sets isCancelled flag (doesn't change status - microtask will clean up)
 * - resetCancel(): Resets flag (called by cancelled microtask)
 * - end(): Sets status to "idle"
 * - start(): Sets status to "pending"
 *
 * See BATCHING_EXPLAINED.md for detailed behavior documentation.
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
			cancel: () => {
				batchManager.state.isCancelled = true;
			},

			end: () => {
				batchManager.state.status = "idle";
			},

			resetCancel: () => {
				batchManager.state.isCancelled = false;
			},

			setPreviousStateSnapshot: (prevState: TState) => {
				batchManager.state.previousStateSnapshot = prevState;
			},

			start: () => {
				batchManager.state.status = "pending";
			},
		},
	};

	return batchManager;
};
