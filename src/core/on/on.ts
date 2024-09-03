import { isArray, isString } from "@/type-helpers";
import type {
	AddEventParams,
	ElementOrSelectorArray,
	ElementOrSelectorSingle,
	ElementOrSelectorSingleOrArray,
	ON,
	RegisterConfig,
} from "./types";

type UnknownFn = (...args: unknown[]) => void;

const registerSingle = (element: ElementOrSelectorSingle<null>, config: RegisterConfig) => {
	const { event, listener, options, type } = config;

	const actionType = type === "add" ? "addEventListener" : "removeEventListener";

	if (element == null) {
		console.error("Element is either undefined or null");
		return;
	}

	if (isString(element)) {
		const nodeList = document.querySelectorAll<HTMLElement>(element);

		nodeList.forEach((node) => node[actionType](event, listener as UnknownFn, options));

		return;
	}

	element[actionType](event, listener as UnknownFn, options);
};

const registerMultiple = (elementArray: ElementOrSelectorArray<null>, config: RegisterConfig) => {
	if (elementArray.length === 0) {
		console.error("ElementArray is empty!");
		return;
	}

	for (const element of elementArray) {
		registerSingle(element, config);
	}
};

const register = (element: ElementOrSelectorSingleOrArray<null>, config: RegisterConfig) => {
	if (isArray(element)) {
		registerMultiple(element, config);

		return;
	}

	registerSingle(element, config);
};

const on: ON = (...params: AddEventParams) => {
	const [event, element, listener, options] = params;

	const boundListener = () => (listener as UnknownFn).apply(element, [event, cleanup]);

	const attach = () => {
		register(element, { event, listener: boundListener, options, type: "add" });

		return cleanup;
	};

	const cleanup = () => {
		register(element, { event, listener: boundListener, options, type: "remove" });

		return attach;
	};

	return attach();
};

export { on };
