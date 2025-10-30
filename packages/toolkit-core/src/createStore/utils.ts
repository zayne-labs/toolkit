type BatchManagerState<TState> = {
	currentStateSnapshot: TState;
	isCancelled: boolean;
	previousStateSnapshot: TState;
	status: "idle" | "pending";
};

export const createBatchManager = <TState>() => {
	const batchManager = {
		state: {
			currentStateSnapshot: undefined as TState,
			isCancelled: false,
			previousStateSnapshot: undefined as TState,
			status: "idle",
		} satisfies BatchManagerState<TState> as BatchManagerState<TState>,

		// eslint-disable-next-line perfectionist/sort-objects -- I want state to come first
		actions: {
			cancel: () => {
				batchManager.state.isCancelled = true;
				batchManager.actions.end();
			},
			end: () => {
				batchManager.state.status = "idle";
			},
			resetCancel: () => {
				batchManager.state.isCancelled = false;
			},
			setCurrentStateSnapshot: (currentState: TState) => {
				batchManager.state.currentStateSnapshot = currentState;
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
