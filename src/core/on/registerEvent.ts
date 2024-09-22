import { isArray, isString } from "@/type-helpers";
import type { ElementOrSelectorArray, PossibleNodes, RegisterConfig } from "./types";

const registerSingleElement = (element: PossibleNodes, config: RegisterConfig) => {
	const { event, listener, options, type } = config;

	const actionType = type === "add" ? "addEventListener" : "removeEventListener";

	if (element == null) {
		console.error("Element is either undefined or null");
		return;
	}

	if (isString(element)) {
		const nodeList = document.querySelectorAll<HTMLElement>(element);

		nodeList.forEach((node) => node[actionType](event, listener as EventListener, options));

		return;
	}

	element[actionType](event, listener as EventListener, options);
};

const registerMultipleElements = (elementArray: ElementOrSelectorArray, config: RegisterConfig) => {
	if (elementArray.length === 0) {
		console.error("ElementArray is empty!");
		return;
	}

	for (const element of elementArray) {
		registerSingleElement(element, config);
	}
};

export const registerEvent = (element: ElementOrSelectorArray | PossibleNodes, config: RegisterConfig) => {
	if (isArray(element)) {
		registerMultipleElements(element, config);

		return;
	}

	registerSingleElement(element, config);
};
