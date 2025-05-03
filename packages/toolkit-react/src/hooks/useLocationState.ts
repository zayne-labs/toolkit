import {
	type LocationInfo,
	type LocationStoreApi,
	type LocationStoreOptions,
	createLocationStore,
} from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useConstant } from "./useConstant";
import { useStore } from "./useStore";

type UseLocationResult<TSlice> = [state: TSlice, actions: LocationStoreApi];

export const createUseLocationState = (options?: LocationStoreOptions) => {
	const locationStore = createLocationStore(options);

	type UseBoundLocationState = LocationStoreApi & {
		<TSlice = LocationInfo>(selector?: SelectorFn<LocationInfo, TSlice>): UseLocationResult<TSlice>;
	};

	const useLocationState = <TSlice = LocationInfo>(
		selector?: SelectorFn<LocationInfo, TSlice>
	): UseLocationResult<TSlice> => {
		const stateSlice = useStore(locationStore as never, selector);

		return [stateSlice, locationStore];
	};

	Object.assign(useLocationState, locationStore);

	return useLocationState as UseBoundLocationState;
};

export const useLocationState = <TSlice = LocationInfo>(
	selector?: SelectorFn<LocationInfo, TSlice>,
	options?: LocationStoreOptions
): UseLocationResult<TSlice> => {
	const locationStore = useConstant(() => createLocationStore(options));

	const stateSlice = useStore(locationStore as never, selector);

	return [stateSlice, locationStore];
};
