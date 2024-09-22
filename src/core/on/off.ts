import { registerEvent } from "./registerEvent";
import type { AddEventParams, OFF } from "./types";

export const off: OFF = (...params: AddEventParams) => {
	const [event, element, listener, options] = params;

	registerEvent(element, { event, listener, options, type: "remove" });
};
