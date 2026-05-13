import type {
	AnyFunction,
	DeepPrettify,
	UnionToIntersection,
	Writeable,
} from "@zayne-labs/toolkit-type-helpers";
import type { StoreApi, StorePlugin } from "./types";

type InitializeStorePluginsContext<TState> = {
	plugins: Array<StorePlugin<TState>> | undefined;
	storeApi: StoreApi<TState>;
};

export const initializeStorePlugins = <TState>(
	context: InitializeStorePluginsContext<TState>
): StoreApi<TState> => {
	const { plugins, storeApi } = context;

	const resolvedStoreApi: StoreApi<TState> = { ...storeApi };

	for (const plugin of plugins ?? []) {
		const initResult = plugin.setup?.(storeApi);

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

export type InferPluginExtraOptions<
	TState,
	TPluginArray extends Array<StorePlugin<TState>>,
> = DeepPrettify<
	UnionToIntersection<
		TPluginArray extends Array<infer TPlugin> ?
			TPlugin extends StorePlugin<TState> ?
				TPlugin["setup"] extends AnyFunction<infer TResult> ?
					TResult
				:	never
			:	never
		:	never
	>
>;

// eslint-disable-next-line ts-eslint/no-explicit-any -- Casting to `any` here is necessary for the generic to infer the plugin type without type errors
export const defineStorePluginWithContext = <TState = any>() => {
	return <const TPlugin extends StorePlugin<TState>>(plugin: TPlugin) => plugin as Writeable<TPlugin>;
};

export const defineStorePlugin = defineStorePluginWithContext();
