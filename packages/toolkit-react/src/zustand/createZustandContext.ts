import type { SelectorFn, UnionDiscriminator } from "@zayne-labs/toolkit-type-helpers";
import { createElement } from "react";
import { type StoreApi, type UseBoundStore, useStore } from "zustand";
import { type CustomContextOptions, createCustomContext, useConstant } from "../hooks";

const createZustandContext = <
	TState extends Record<string, unknown>,
	TUseBoundStore extends UseBoundStore<StoreApi<TState>> = UseBoundStore<StoreApi<TState>>,
	TStore extends StoreApi<TState> = StoreApi<TState>,
>(
	options?: CustomContextOptions<TUseBoundStore, true>
) => {
	const [Provider, useCustomContext] = createCustomContext(options);

	type ZustandProviderProps = UnionDiscriminator<
		[{ store: TStore }, { storeCreator: () => TUseBoundStore }, { value: TUseBoundStore }]
	> & { children: React.ReactNode };

	function ZustandProvider(props: ZustandProviderProps) {
		const { children, store, storeCreator, value } = props;

		const useZustandStore = useConstant(() => {
			switch (true) {
				case Boolean(storeCreator): {
					return storeCreator();
				}
				case Boolean(value): {
					return value;
				}
				case Boolean(store): {
					const useBoundStore = (selector: SelectorFn<TState, unknown>) => useStore(store, selector);
					Object.assign(useBoundStore, store);
					return useBoundStore as TUseBoundStore;
				}
				default: {
					throw new Error("No store provided");
				}
			}
		});

		return createElement(Provider, { value: useZustandStore }, children);
	}

	const useBoundStore = <TResult = TState>(selector?: SelectorFn<TState, TResult>): TResult => {
		const useZustandStore = useCustomContext();

		return useZustandStore(selector as never);
	};

	return [ZustandProvider, useBoundStore] as [
		ZustandProvider: typeof ZustandProvider,
		useBoundStore: typeof useBoundStore,
	];
};

export { createZustandContext };
