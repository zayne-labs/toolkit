import { shallowCompare } from "@zayne-labs/toolkit-core";
import { useRef } from "react";

const useShallowCompare = <TState, TResult>(
	selector: (state: TState) => TResult
): ((state: TState) => TResult) => {
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
