import { shallowCompare } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useRef } from "react";

const useShallowCompare = <TState, TResult>(selector: SelectorFn<TState, TResult>) => {
	const prev = useRef<TResult>(undefined as never);

	const shallowSelector = (state: TState) => {
		const nextState = selector(state);

		if (shallowCompare(prev.current, nextState)) {
			return prev.current;
		}

		return (prev.current = nextState);
	};

	return shallowSelector;
};

export { useShallowCompare };
