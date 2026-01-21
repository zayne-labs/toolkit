import type { StoreApi, StorePlugin } from "./types";

type InitializeStorePluginsContext<TState> = {
	plugins: StorePlugin[] | undefined;
	storeApi: StoreApi<TState>;
};

export const initializeStorePlugins = <TState>(
	context: InitializeStorePluginsContext<TState>
): StoreApi<TState> => {
	const { plugins, storeApi } = context;

	const resolvedStoreApi: StoreApi<TState> = { ...storeApi };

	for (const plugin of plugins ?? []) {
		const initResult = plugin.setup?.(storeApi as unknown as StoreApi<never>);

		if (!initResult) continue;

		const previousSubscribe = resolvedStoreApi.subscribe;

		Object.assign(resolvedStoreApi, initResult);

		if (
			resolvedStoreApi.subscribe !== previousSubscribe
			&& !Object.hasOwn(resolvedStoreApi.subscribe, "withSelector")
		) {
			resolvedStoreApi.subscribe.withSelector = previousSubscribe.withSelector;
		}
	}

	return resolvedStoreApi;
};

export const defineStorePlugin = (plugin: StorePlugin) => plugin;
