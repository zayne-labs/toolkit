import { useRef } from "react";

const useConstant = <TResult>(initCallbackFn: () => TResult) => {
	const resultRef = useRef<TResult | null>(null);

	if (resultRef.current === null) {
		resultRef.current = initCallbackFn();
	}

	return resultRef.current;
};

export { useConstant };
