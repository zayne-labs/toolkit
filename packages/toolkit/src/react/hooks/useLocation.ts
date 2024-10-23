import { type LocationState, createLocationStore } from "@/core/createLocationStore";
import type { SelectorFn } from "@/type-helpers";
import { useConstant } from "./useConstant";
import { useStore } from "./useStore";

const useLocation = <TSlice = LocationState>(
	selector: SelectorFn<LocationState, TSlice> = (store) => store as TSlice
) => {
	const locationStore = useConstant(() => createLocationStore());

	const stateSlice = useStore(locationStore as never, selector);

	return [stateSlice, { push: locationStore.push, replace: locationStore.replace }] as [
		state: TSlice,
		setState: { push: typeof locationStore.push; replace: typeof locationStore.replace },
	];
};

export { useLocation };
