import { isArray, isString } from "@zayne-labs/toolkit-type-helpers";
import type { ElementOrSelector, ElementOrSelectorArray, RegisterConfig } from "./types";

const registerSingleElement = (element: ElementOrSelector, config: RegisterConfig) => {
	const {
		event,
		listener,
		options,
		queryScope = document,
		queryType = "querySelectorAll",
		type,
	} = config;

	const actionType = type === "add" ? "addEventListener" : "removeEventListener";

	if (element == null) {
		console.error("Element is either undefined or null");
		return;
	}

	if (isString(element)) {
		const nodeOrNodeList = queryScope[queryType as "querySelector"](element);

		if (nodeOrNodeList instanceof NodeList) {
			nodeOrNodeList.forEach((node) => node[actionType](event, listener as EventListener, options));
		}

		if (nodeOrNodeList === null) {
			console.error("Element is either undefined or null");
			return;
		}

		nodeOrNodeList[actionType](event, listener as EventListener, options);

		return;
	}

	element[actionType](event, listener as EventListener, options);
};

const registerMultipleElements = (elementArray: ElementOrSelectorArray, config: RegisterConfig) => {
	for (const element of elementArray) {
		registerSingleElement(element, config);
	}
};

export const registerEvent = (
	element: ElementOrSelector | ElementOrSelectorArray,
	config: RegisterConfig
) => {
	if (isArray(element)) {
		registerMultipleElements(element, config);

		return;
	}

	registerSingleElement(element, config);
};
