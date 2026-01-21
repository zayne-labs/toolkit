import type { AnyFunction } from "@zayne-labs/toolkit-type-helpers";
import type { StoreStateInitializer } from "../types";

type Combine<TState, TActions> = Omit<TState, keyof TActions> & TActions;

const combine = <TState, TActions>(
	initialState: TState,
	actions: StoreStateInitializer<TState, TActions>
): StoreStateInitializer<Combine<TState, TActions>> => {
	return (...parameters) => {
		return {
			...initialState,
			...(actions as AnyFunction<TActions>)(...parameters),
		};
	};
};

export { combine };
