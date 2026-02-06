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

type BatchManager<TState> = {
	actions: BatchManagerActions<TState>;
	state: BatchManagerState<TState>;
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

const defaultInitialStateSymbol = Symbol("initialStateSnapshot");

export const createBatchManager = <TState>(options: {
	initialState: TState | (() => TState);
}): BatchManager<TState> => {
	const { initialState } = options;

	const getInitialState = () => (isFunction(initialState) ? initialState() : initialState);

	const state = {
		isCancelled: false,
		previousStateSnapshot: defaultInitialStateSymbol as never,
		status: "idle",
	} satisfies BatchManagerState<TState> as BatchManagerState<TState>;

	const cancel: BatchManagerActions<TState>["cancel"] = () => {
		state.isCancelled = true;
	};

	const end: BatchManagerActions<TState>["end"] = () => {
		state.status = "idle";
	};

	const resetCancel: BatchManagerActions<TState>["resetCancel"] = () => {
		state.isCancelled = false;
	};

	const setPreviousStateSnapshot: BatchManagerActions<TState>["setPreviousStateSnapshot"] = (
		prevState
	) => {
		state.previousStateSnapshot = prevState;
	};

	const schedule: BatchManagerActions<TState>["schedule"] = (scheduleOptions) => {
		const { context, onNotifySync, onNotifyViaBatch } = scheduleOptions;

		const { previousState, shouldNotifySync } = context;

		if (shouldNotifySync) {
			state.status === "active" && cancel();

			onNotifySync(previousState);

			return;
		}

		if (state.status === "active") return;

		start();

		setPreviousStateSnapshot(previousState);

		queueMicrotask(() => {
			end();

			if (state.isCancelled) {
				resetCancel();
				return;
			}

			const previousStateSnapshot =
				state.previousStateSnapshot === defaultInitialStateSymbol ?
					getInitialState()
				:	state.previousStateSnapshot;

			onNotifyViaBatch(previousStateSnapshot);
		});
	};

	const start: BatchManagerActions<TState>["start"] = () => {
		state.status = "active";
	};

	const batchManager: BatchManager<TState> = {
		actions: { cancel, end, resetCancel, schedule, setPreviousStateSnapshot, start },
		state,
	};

	return batchManager;
};
