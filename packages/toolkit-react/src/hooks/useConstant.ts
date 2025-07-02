import { useRef } from "react";

export const useConstant = <TResult>(initCallbackFn: () => TResult): TResult => {
	const resultRef = useRef<TResult | null>(null);

	// eslint-disable-next-line ts-eslint/prefer-nullish-coalescing -- The current case is justified since it's optimizable by the react compiler
	if (resultRef.current === null) {
		resultRef.current = initCallbackFn();
	}

	return resultRef.current;
};

export const useLazyRef = <TResult>(initCallbackFn: () => TResult): React.RefObject<TResult> => {
	const resultRef = useRef<TResult | null>(null);

	// eslint-disable-next-line ts-eslint/prefer-nullish-coalescing -- The current case is justified since it's optimizable by the react compiler
	if (resultRef.current === null) {
		resultRef.current = initCallbackFn();
	}

	return resultRef as React.RefObject<TResult>;
};
