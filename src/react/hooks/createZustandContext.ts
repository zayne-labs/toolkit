import type { SelectorFn } from "@/type-helpers";
import { cloneElement } from "react";
import type { StoreApi, UseBoundStore } from "zustand";
import { type CustomContextOptions, createCustomContext } from "./createCustomContext";
import { useConstant } from "./useConstant";

const createZustandContext = <
	TState extends Record<string, unknown>,
	TUseBoundStore extends UseBoundStore<StoreApi<TState>> = UseBoundStore<StoreApi<TState>>,
>(
	options?: CustomContextOptions<TUseBoundStore, true>
) => {
	const [Provider, useCustomContext] = createCustomContext(options);

	type ZustandProviderProps =
		| {
				children: React.ReactNode;
				createStore: () => TUseBoundStore;
		  }
		| {
				children: React.ReactNode;
				value: TUseBoundStore;
		  };

	// eslint-disable-next-line jsdoc/require-jsdoc
	function ZustandProvider(props: ZustandProviderProps) {
		const { children, ...restOfProps } = props;

		const useZustandStore = useConstant(() =>
			"createStore" in restOfProps ? restOfProps.createStore() : restOfProps.value
		);

		return cloneElement(
			Provider as never,
			{ value: useZustandStore },
			children
		) as unknown as React.Provider<TUseBoundStore>;
	}

	const useBoundStore = <TResult>(selector: SelectorFn<TState, TResult>) => useCustomContext()(selector);

	return [ZustandProvider, useBoundStore] as const;
};

export { createZustandContext };