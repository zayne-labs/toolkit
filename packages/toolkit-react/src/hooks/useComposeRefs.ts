import { useMemo } from "react";
import { composeRefs, type PossibleRef } from "@/utils";

const useComposeRefs = <TRef extends HTMLElement>(...refs: Array<PossibleRef<TRef>>) => {
	// eslint-disable-next-line react-x/exhaustive-deps, react-hooks/use-memo -- Allow
	const mergedRef = useMemo(() => composeRefs(...refs), [...refs]);

	return mergedRef;
};

export { useComposeRefs };
