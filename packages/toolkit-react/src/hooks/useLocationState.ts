import {
	createLocationStore,
	type LocationInfo,
	type LocationStoreApi,
	type LocationStoreOptions,
} from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useMemo } from "react";
import { useCallbackRef } from "./useCallbackRef";
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

	const locationStore = useMemo(
		() => createLocationStore({ defaultValues, equalityFn: stableEqualityFn }),
		// eslint-disable-next-line react-hooks/rule-suppression -- Ignore
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Ignore
		[stableEqualityFn, JSON.stringify(defaultValues)]
	);

	const stateSlice = useStore(locationStore as never, selector);

	return [stateSlice, locationStore];
};
