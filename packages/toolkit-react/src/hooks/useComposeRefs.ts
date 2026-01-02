import { useMemo } from "react";
import { composeRefs, type PossibleRef } from "@/utils";

const useComposeRefs = <TRef extends HTMLElement>(...refs: Array<PossibleRef<TRef>>) => {
	// eslint-disable-next-line react-hooks/rule-suppression -- Allow
	// eslint-disable-next-line react-hooks/exhaustive-deps -- Allow
	const mergedRef = useMemo(() => composeRefs(...refs), refs);

	return mergedRef;
};

export { useComposeRefs };
