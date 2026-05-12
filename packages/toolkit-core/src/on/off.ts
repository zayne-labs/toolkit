import { registerEvent } from "./registerEvent";
import type { AddEventParams, OFF } from "./types";

export const off: OFF = (...params: AddEventParams) => {
	const [element, event, listener, options] = params;

	registerEvent(element as never, { event, listener, options, type: "remove" });
};
