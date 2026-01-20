import { isFunction } from "@zayne-labs/toolkit-type-helpers";

export type BatchManagerState<TState> = {
	isCancelled: boolean;
	previousStateSnapshot: TState;
	status: "active" | "idle";
};

export type BatchManagerActions<TState> = {
	cancel: () => void;
	end: () => void;
	resetCancel: () => void;
	schedule: (scheduleOptions: ScheduleBatchOptions<TState>) => void;
	setPreviousStateSnapshot: (prevState: TState) => void;
	start: () => void;
};

export type ScheduleBatchOptions<TState> = {
	context: {
		previousState: TState;
		shouldNotifySync: boolean;
	};
	onNotifySync: (previousState: TState) => void;
	onNotifyViaBatch: (previousStateSnapshot: TState) => void;
};

/**
 * @description Manages batching state for store updates.
 *
 * State:
 * - status: "active" | "idle" - Whether a microtask is scheduled.
 * - isCancelled: Flag to abort a scheduled microtask (used when shouldNotifySync is true).
 * - previousStateSnapshot: State captured when the batch started (initialized to initialState to prevent undefined).
 *
 * Key Rules:
 * 1. Only one microtask is scheduled per batch (guarded by status === "active").
 * 2. This microtask "owns" the batch status and is responsible for determining when the batch ends.
 * 3. previousStateSnapshot is captured ONLY when the batch starts (transition from IDLE to ACTIVE).
 * 4. Cancellation is cooperative: cancel() sets a flag, but the microtask still runs to clean up metadata.
 *
 * Actions:
 * - schedule(): Orchestrates the batching logic (starts batch, handles sync updates, schedules microtask).
 * - cancel(): Sets isCancelled flag (doesn't change status; microtask will clean up).
 * - resetCancel(): Resets isCancelled flag (called by the cancelled microtask).
 * - end(): Sets status to "idle".
 * - start(): Sets status to "active".
 * - setPreviousStateSnapshot(): Sets previousStateSnapshot.
 *
 * See BATCHING_EXPLAINED.md for detailed behavior documentation.
 */
export const createBatchManager = <TState>(options: { initialState: TState | (() => TState) }) => {
	const { initialState } = options;

	const defaultInitialStateSymbol = Symbol.for("initialStateSnapshot");

	const getInitialState = () => (isFunction(initialState) ? initialState() : initialState);

	const batchManager = {
		state: {
			isCancelled: false,
			previousStateSnapshot: defaultInitialStateSymbol as never,
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

			schedule: (scheduleOptions) => {
				const { context, onNotifySync, onNotifyViaBatch } = scheduleOptions;

				const { previousState, shouldNotifySync } = context;

				if (shouldNotifySync) {
					batchManager.state.status === "active" && batchManager.actions.cancel();

					onNotifySync(previousState);

					return;
				}

				if (batchManager.state.status === "active") return;

				batchManager.actions.start();

				batchManager.actions.setPreviousStateSnapshot(previousState);

				queueMicrotask(() => {
					batchManager.actions.end();

					if (batchManager.state.isCancelled) {
						batchManager.actions.resetCancel();
						return;
					}

					const previousStateSnapshot =
						batchManager.state.previousStateSnapshot === defaultInitialStateSymbol ?
							getInitialState()
						:	batchManager.state.previousStateSnapshot;

					onNotifyViaBatch(previousStateSnapshot);
				});
			},

			setPreviousStateSnapshot: (prevState) => {
				batchManager.state.previousStateSnapshot = prevState;
			},

			start: () => {
				batchManager.state.status = "active";
			},
		} satisfies BatchManagerActions<TState> as BatchManagerActions<TState>,
	};

	return batchManager;
};
