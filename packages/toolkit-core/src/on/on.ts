import { registerEvent } from "./registerEvent";
import type { AddEventParams, ON } from "./types";

export const on: ON = (...params: AddEventParams) => {
	const [event, element, listener, options] = params;

	const attachEvent = () => {
		registerEvent(element, { event, listener, options, type: "add" });

		return cleanup;
	};

	const cleanup = () => {
		registerEvent(element, { event, listener, options, type: "remove" });

		return attachEvent;
	};

	return attachEvent();
};
