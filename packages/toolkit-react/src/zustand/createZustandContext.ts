import type { SelectorFn, UnionDiscriminator } from "@zayne-labs/toolkit-type-helpers";
import { createElement } from "react";
import { type StoreApi, useStore } from "zustand";
import { type CustomContextOptions, createCustomContext, useConstant } from "../hooks";

const createZustandContext = <
	TState extends Record<string, unknown>,
	TStore extends StoreApi<TState> = StoreApi<TState>,
>(
	options?: CustomContextOptions<TStore, true>
) => {
	const [Provider, useCustomContext] = createCustomContext(options);

	type ZustandStoreContextProviderProps = UnionDiscriminator<
		[{ store: TStore }, { storeCreator: () => TStore }]
	> & { children: React.ReactNode };

	function ZustandStoreContextProvider(props: ZustandStoreContextProviderProps) {
		const { children, store, storeCreator } = props;

		const useZustandStore = useConstant(() => {
			switch (true) {
				case Boolean(storeCreator): {
					return storeCreator();
				}
				case Boolean(store): {
					return store;
				}
				default: {
					throw new Error("No store provided");
				}
			}
		});

		return createElement(Provider, { value: useZustandStore }, children);
	}

	const useZustandStoreContext = <TResult = TState>(selector?: SelectorFn<TState, TResult>): TResult => {
		const zustandStore = useCustomContext();

		return useStore(zustandStore, selector as never);
	};

	return [ZustandStoreContextProvider, useZustandStoreContext] as [
		ZustandStoreContextProvider: typeof ZustandStoreContextProvider,
		useZustandStoreContext: typeof useZustandStoreContext,
	];
};

export { createZustandContext };
