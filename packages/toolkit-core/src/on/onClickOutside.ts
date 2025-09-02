import { toArray } from "../common-utils";
import { on } from "./on";

type ElementType<TElement extends HTMLElement> = TElement | null;

export const onClickOutside = <TElement extends HTMLElement>(
	elementOrElementArray: Array<ElementType<TElement>> | ElementType<TElement>,
	callback: (event: MouseEvent | TouchEvent) => void,
	options?: boolean | AddEventListenerOptions
) => {
	const elementArray = toArray(elementOrElementArray).filter(Boolean);

	const onClick: typeof callback = (event) => {
		const isClickOutsideElement = elementArray.every(
			(element) => !element.contains(event.target as Node)
		);

		if (isClickOutsideElement) {
			callback(event);
		}
	};

	const cleanup = on("click", document, onClick, options);

	return cleanup;
};
