import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { createElement } from "react";
import type { StoreApi, UseBoundStore } from "zustand";
import { type CustomContextOptions, createCustomContext, useConstant } from "../hooks";

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
				storeCreator: () => TUseBoundStore;
		  }
		| {
				children: React.ReactNode;
				value: TUseBoundStore;
		  };

	function ZustandProvider(props: ZustandProviderProps) {
		const { children, ...restOfProps } = props;

		const useZustandStore = useConstant(() =>
			"storeCreator" in restOfProps ? restOfProps.storeCreator() : restOfProps.value
		);

		return createElement(Provider, { value: useZustandStore }, children);
	}

	const useBoundStore = <TResult>(selector: SelectorFn<TState, TResult>) => useCustomContext()(selector);

	return [ZustandProvider, useBoundStore] as [
		ZustandProvider: typeof ZustandProvider,
		useBoundStore: typeof useBoundStore,
	];
};

export { createZustandContext };
