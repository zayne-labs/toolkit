import { useRef } from "react";

export const useLazyRef = <TResult>(initFn: () => TResult): React.RefObject<TResult> => {
	const resultRef = useRef<TResult>(null as never);

	// eslint-disable-next-line ts-eslint/prefer-nullish-coalescing -- The current case is justified since it's optimizable by the react compiler
	if (resultRef.current === null) {
		resultRef.current = initFn();
	}

	return resultRef;
};

export const useConstant = <TResult>(initFn: () => TResult): TResult => {
	const resultRef = useLazyRef(initFn);

	// eslint-disable-next-line react/refs -- Allow this for convenience
	return resultRef.current;
};
