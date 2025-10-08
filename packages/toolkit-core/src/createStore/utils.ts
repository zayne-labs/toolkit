type BatchManagerState<TState> = {
	isCancelled: boolean;
	previousStateSnapshot: TState;
	status: "idle" | "pending";
};

export const createBatchManager = <TState>() => {
	const batchManager = {
		state: {
			isCancelled: false,
			previousStateSnapshot: undefined as TState,
			status: "idle",
		} satisfies BatchManagerState<TState> as BatchManagerState<TState>,

		// eslint-disable-next-line perfectionist/sort-objects -- I want state to come first
		actions: {
			cancel: () => {
				batchManager.state.status = "idle";
				batchManager.state.isCancelled = true;
			},
			end: () => {
				batchManager.state.status = "idle";
			},
			resetCancel: () => {
				batchManager.state.isCancelled = false;
			},
			setPreviousStateSnapshot: (state: TState) => {
				batchManager.state.previousStateSnapshot = state;
			},
			start: () => {
				batchManager.state.status = "pending";
			},
		},
	};

	return batchManager;
};
