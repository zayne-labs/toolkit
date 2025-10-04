export const createBatchManager = () => {
	const batchManager = {
		state: {
			isPending: false,
			shouldCancelExisting: false,
		},

		// eslint-disable-next-line perfectionist/sort-objects -- I want state to come first
		actions: {
			cancelExisting: () => {
				batchManager.state.shouldCancelExisting = true;
			},
			cancelExistingAndEnd: () => {
				batchManager.actions.cancelExisting();
				batchManager.actions.end();
			},
			end: () => {
				batchManager.state.isPending = false;
			},
			resetCancelExisting: () => {
				batchManager.state.shouldCancelExisting = false;
			},
			start: () => {
				batchManager.state.isPending = true;
			},
		},
	};

	return batchManager;
};
