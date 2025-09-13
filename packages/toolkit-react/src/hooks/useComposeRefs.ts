import { useCallback } from "react";
import { composeRefs, type PossibleRef } from "@/utils";

const useComposeRefs = <TRef extends HTMLElement>(...refs: Array<PossibleRef<TRef>>) => {
	// eslint-disable-next-line react-hooks/exhaustive-deps -- Allow
	const mergedRef = useCallback(() => composeRefs(...refs), refs);

	return mergedRef;
};

export { useComposeRefs };
