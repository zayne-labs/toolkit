import { useRef } from "react";

export const useConstant = <TResult>(initFn: () => TResult): TResult => {
	const resultRef = useRef<TResult | null>(null);

	// eslint-disable-next-line ts-eslint/prefer-nullish-coalescing -- The current case is justified since it's optimizable by the react compiler
	if (resultRef.current === null) {
		resultRef.current = initFn();
	}

	// eslint-disable-next-line react-hooks/refs -- Allow this for convenience
	return resultRef.current;
};

export const useLazyRef = <TResult>(initFn: () => TResult): React.RefObject<TResult> => {
	const resultRef = useRef<TResult>(null as never);

	// eslint-disable-next-line ts-eslint/prefer-nullish-coalescing -- The current case is justified since it's optimizable by the react compiler
	if (resultRef.current === null) {
		resultRef.current = initFn();
	}

	return resultRef;
};
