import { type LocationState, createLocationStore } from "@/core/createLocationStore";
import type { SelectorFn } from "@/type-helpers";
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

const useLocation = <TSlice = LocationState>(selector: SelectorFn<LocationState, TSlice>) => {
	const locationStore = useConstant(() => createLocationStore());

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
