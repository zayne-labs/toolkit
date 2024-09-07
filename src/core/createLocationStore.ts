import type { Prettify } from "@/type-helpers";
import { isBrowser } from "./constants";
import type { StoreApi, SubscribeOptions } from "./createStore";
import { on } from "./on";

export type LocationState = {
	hash: string;
	pathname: string;
	search: string;
	state: NonNullable<unknown> | null;
};

type LocationStoreOptions = Prettify<Pick<SubscribeOptions<LocationState>, "equalityFn">>;

const createLocationStore = <TLocationSlice = LocationState>(options: LocationStoreOptions = {}) => {
	let locationState: LocationState = {
		hash: isBrowser() ? window.location.hash : "",
		pathname: isBrowser() ? window.location.pathname : "",
		search: isBrowser() ? window.location.search : "",
		state: isBrowser() ? (window.history.state as LocationState["state"]) : null,
	};

	const initialState = locationState;

	const getState = () => locationState;

	const getInitialState = () => initialState;

	const { equalityFn = Object.is } = options;

	const push = (url: string | URL, state: unknown = null) => {
		window.history.pushState(state, "", url);

		// == This has to be done in order to actually trigger the popState event, which usually only fires in the user clicks on the forward/back button.
		// LINK - https://stackoverflow.com/a/37492075/18813022

		window.dispatchEvent(new PopStateEvent("popstate", { state }));
	};

	const replace = (url: string | URL, state: unknown = null) => {
		window.history.replaceState(state, "", url);

		window.dispatchEvent(new PopStateEvent("popstate", { state }));
	};

	const setLocationState = (nextLocationState: LocationState) => {
		if (equalityFn(locationState, nextLocationState)) {
			return locationState;
		}

		const previousLocationState = locationState;

		locationState = nextLocationState;

		return previousLocationState;
	};

	type Subscribe = StoreApi<LocationState, TLocationSlice>["subscribe"];

	const subscribe: Subscribe = (onLocationStoreChange) => {
		const handleLocationStoreChange = () => {
			const previousLocationState = setLocationState({
				hash: window.location.hash,
				pathname: window.location.pathname,
				search: window.location.search,
				state: window.history.state as LocationState["state"],
			});

			onLocationStoreChange(locationState, previousLocationState);
		};

		const removePopStateEvent = on("popstate", window, handleLocationStoreChange);

		return removePopStateEvent;
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: $equalityFn = equalityFn, fireListenerImmediately = false } = subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(getState()) as unknown as LocationState;

			onStoreChange(slice, slice);
		}

		const handleStoreChange: Parameters<Subscribe>[0] = (state, prevState) => {
			const previousSlice = selector(prevState) as unknown as LocationState;
			const slice = selector(state) as unknown as LocationState;

			if ($equalityFn(slice, previousSlice)) return;

			onStoreChange(slice, previousSlice);
		};

		return subscribe(handleStoreChange);
	};

	const locationStore = {
		getInitialState,
		getState,
		push,
		replace,
		subscribe,
	};

	return locationStore;
};

export { createLocationStore };
