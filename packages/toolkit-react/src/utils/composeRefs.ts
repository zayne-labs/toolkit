import { isFunction } from "@zayne-labs/toolkit-type-helpers";

/**
 * @description Set a given ref to a given value.
 *
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
export const setRef = <TRef>(ref: React.Ref<TRef> | undefined, node: TRef) => {
	if (!ref) return;

	if (isFunction(ref)) {
		return ref(node);
	}

	// eslint-disable-next-line no-param-reassign -- Mutation is needed here
	ref.current = node;
};

/**
 * @description A utility to compose refs together.
 *
 * Accepts callback refs and RefObject(s)
 */
export const composeRefs = <TRef>(refs: Array<React.Ref<TRef> | undefined>): React.RefCallback<TRef> => {
	const refCallBack: React.RefCallback<TRef> = (node) => {
		const cleanupFnArray = refs.map((ref) => setRef(ref, node));

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
