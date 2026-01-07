import {
	createLocationStore,
	type LocationInfo,
	type LocationStoreApi,
	type LocationStoreOptions,
} from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useMemo } from "react";
import { useCallbackRef } from "./useCallbackRef";
import { useCompareValue } from "./useCompare";
import { useStore } from "./useStore";

type UseLocationResult<TSlice> = [state: TSlice, actions: LocationStoreApi];

export const createUseLocationState = (options?: LocationStoreOptions) => {
	const locationStore = createLocationStore(options);

	type UseBoundLocationState = LocationStoreApi
		& (<TSlice = LocationInfo>(
			selector?: SelectorFn<LocationInfo, TSlice>
		) => UseLocationResult<TSlice>);

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
	options: LocationStoreOptions = {}
): UseLocationResult<TSlice> => {
	const { defaultValues, equalityFn } = options;

	const stableEqualityFn = useCallbackRef(equalityFn);
	const stableDefaultValues = useCompareValue(defaultValues, { compareFnOptions: { maxDepth: 2 } });

	const locationStore = useMemo(
		() => createLocationStore({ defaultValues: stableDefaultValues, equalityFn: stableEqualityFn }),
		[stableEqualityFn, stableDefaultValues]
	);

	const stateSlice = useStore(locationStore as never, selector);

	return [stateSlice, locationStore];
};
