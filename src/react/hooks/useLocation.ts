import { type LocationState, createLocationStore } from "@/core/createLocationStore";
import type { SelectorFn } from "@/type-helpers";
import { useSyncExternalStore } from "react";
import { useConstant } from "./useConstant";

const useLocation = <TSlice = LocationState>(
	selector: SelectorFn<LocationState, TSlice> = (store) => store as TSlice
) => {
	const locationStore = useConstant(() => createLocationStore());

	const stateSlice = useSyncExternalStore(
		locationStore.subscribe,
		() => selector(locationStore.getState()),
		() => selector(locationStore.getState())
	);

	return [stateSlice, { push: locationStore.push, replace: locationStore.replace }] as [
		state: typeof stateSlice,
		setState: { push: typeof locationStore.push; replace: typeof locationStore.replace },
	];
};

export { useLocation };
