import { isArray, isString } from "@/type-helpers";
import type {
	AddEventParams,
	ElementOrSelectorArray,
	OFF,
	ON,
	PossibleNodes,
	RegisterConfig,
} from "./types";

type EventListenerFn = (event: Event) => void;

const registerSingle = (element: PossibleNodes, config: RegisterConfig) => {
	const { event, listener, options, type } = config;

	const actionType = type === "add" ? "addEventListener" : "removeEventListener";

	if (element == null) {
		console.error("Element is either undefined or null");
		return;
	}

	if (isString(element)) {
		const nodeList = document.querySelectorAll<HTMLElement>(element);

		nodeList.forEach((node) => node[actionType](event, listener as EventListenerFn, options));

		return;
	}

	element[actionType](event, listener as EventListenerFn, options);
};

const registerMultiple = (elementArray: ElementOrSelectorArray, config: RegisterConfig) => {
	if (elementArray.length === 0) {
		console.error("ElementArray is empty!");
		return;
	}

	for (const element of elementArray) {
		registerSingle(element, config);
	}
};

const register = (element: ElementOrSelectorArray | PossibleNodes, config: RegisterConfig) => {
	if (isArray(element)) {
		registerMultiple(element, config);

		return;
	}

	registerSingle(element, config);
};

export const on: ON = (...params: AddEventParams) => {
	const [event, element, listener, options] = params;

	const attach = () => {
		register(element, { event, listener, options, type: "add" });

		return cleanup;
	};

	const cleanup = () => {
		register(element, { event, listener, options, type: "remove" });

		return attach;
	};

	return attach();
};

export const off: OFF = (...params: AddEventParams) => {
	const [event, element, listener, options] = params;

	register(element, { event, listener, options, type: "remove" });
};