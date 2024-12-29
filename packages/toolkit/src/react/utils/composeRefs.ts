import { isFunction } from "@/type-helpers";
import type { RefCallback } from "./types";

/**
 * @description Set a given ref to a given value.
 *
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
const setRef = <TRef>(ref: React.Ref<TRef>, value: TRef) => {
	if (!ref) return;

	if (isFunction(ref)) {
		return ref(value);
	}

	// eslint-disable-next-line no-param-reassign -- Mutation is needed here
	ref.current = value;
};

/**
 * @description A utility to compose refs together.
 *
 * Accepts callback refs and RefObject(s)
 */
const composeRefs = <TRef>(refs: Array<React.Ref<TRef>>): RefCallback<TRef> => {
	const refCallBack: RefCallback<TRef> = (node) => {
		const cleanupFnArray = refs.map((ref) => setRef(ref, node)).filter(Boolean);

		const cleanupFn = () => cleanupFnArray.forEach((cleanup) => cleanup?.());

		// == React 18 may not call the cleanup function so we need to call it manually on element unmount
		if (!node) {
			cleanupFn();
			return;
		}

		return cleanupFn;
	};

	return refCallBack;
};

export { composeRefs };
