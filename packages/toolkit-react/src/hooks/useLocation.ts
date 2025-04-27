import {
	type LocationInfo,
	type LocationStoreOptions,
	createLocationStore,
} from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useConstant } from "./useConstant";
import { useStore } from "./useStore";

type LocationStore = ReturnType<typeof createLocationStore>;

type UseLocationResult<TSlice> = [
	state: TSlice,
	setState: {
		push: LocationStore["push"];
		replace: LocationStore["replace"];
		triggerPopstate: LocationStore["triggerPopstateEvent"];
	},
];

const useLocation = <TSlice = LocationInfo>(
	selector?: SelectorFn<LocationInfo, TSlice>,
	options?: LocationStoreOptions
) => {
	const locationStore = useConstant(() => createLocationStore(options));

	const stateSlice = useStore(locationStore as never, selector);

	return [
		stateSlice,
		{
			push: locationStore.push,
			replace: locationStore.replace,
			triggerPopstate: locationStore.triggerPopstateEvent,
		},
	] as UseLocationResult<TSlice>;
};

export { useLocation };
