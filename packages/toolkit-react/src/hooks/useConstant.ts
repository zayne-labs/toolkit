import { useRef } from "react";

export const useLazyRef = <TResult>(initFn: () => TResult): React.RefObject<TResult> => {
	const resultRef = useRef<TResult>(null as never);

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
