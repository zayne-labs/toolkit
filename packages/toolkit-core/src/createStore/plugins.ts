import type {
	AnyFunction,
	DeepPrettify,
	UnionToIntersection,
	Writeable,
} from "@zayne-labs/toolkit-type-helpers";
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

export type InferPluginExtraOptions<TPluginArray extends StorePlugin[]> = DeepPrettify<
	UnionToIntersection<
		TPluginArray extends Array<infer TPlugin> ?
			TPlugin extends StorePlugin ?
				TPlugin["setup"] extends AnyFunction<infer TResult> ?
					TResult
				:	never
			:	never
		:	never
	>
>;

export const defineStorePlugin = <const TPlugin extends StorePlugin>(plugin: TPlugin) => {
	return plugin as Writeable<TPlugin>;
};
