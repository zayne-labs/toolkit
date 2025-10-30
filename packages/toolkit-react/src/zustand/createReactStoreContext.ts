import type { StoreApi } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { createElement } from "react";
import { type CustomContextOptions, createCustomContext, useStore } from "../hooks";

const createReactStoreContext = <
	TState extends Record<string, unknown>,
	TStore extends StoreApi<TState> = StoreApi<TState>,
>(
	options?: CustomContextOptions<TStore, true>
) => {
	const [Provider, useCustomContext] = createCustomContext(options);

	type ZustandStoreContextProviderProps = {
		children: React.ReactNode;
		store: TStore;
	};

	function ZustandStoreContextProvider(props: ZustandStoreContextProviderProps) {
		const { children, store } = props;

		return createElement(Provider, { value: store }, children);
	}

	const useZustandStoreContext = <TResult = TState>(selector?: SelectorFn<TState, TResult>): TResult => {
		const zustandStore = useCustomContext();

		return useStore(zustandStore, selector);
	};

	return [ZustandStoreContextProvider, useZustandStoreContext] as [
		ZustandStoreContextProvider: typeof ZustandStoreContextProvider,
		useZustandStoreContext: typeof useZustandStoreContext,
	];
};

export { createReactStoreContext };
