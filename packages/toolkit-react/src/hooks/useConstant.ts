import { useRef } from "react";

const useConstant = <TResult>(initCallbackFn: () => TResult) => {
	const resultRef = useRef<TResult | null>(null);

	// eslint-disable-next-line ts-eslint/prefer-nullish-coalescing -- The current case is justified since it's optimizable by the react compiler
	if (resultRef.current === null) {
		resultRef.current = initCallbackFn();
	}

	return resultRef.current;
};

export { useConstant };
