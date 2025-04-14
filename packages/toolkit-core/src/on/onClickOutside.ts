import { toArray } from "@/common-utils";
import { on } from "./on";

export const onClickOutside = <TElement extends HTMLElement>(
	elementOrElementArray: TElement | TElement[],
	callback: (event: MouseEvent | TouchEvent) => void,
	options?: boolean | AddEventListenerOptions
) => {
	const elementArray = toArray(elementOrElementArray);

	const cleanup = on(
		"click",
		document,
		(event) => {
			const isClickOutsideElement = elementArray.every(
				(element) => !element.contains(event.target as Node)
			);

			if (isClickOutsideElement) {
				callback(event);
			}
		},
		options
	);

	return cleanup;
};
