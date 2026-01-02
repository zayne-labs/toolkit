import { isObject, type AnyFunction } from "@zayne-labs/toolkit-type-helpers";

const isSyntheticEvent = (event: unknown): event is React.SyntheticEvent => {
	return isObject(event) && Object.hasOwn(event, "nativeEvent");
};

export const composeTwoEventHandlers = (
	formerHandler: AnyFunction | undefined,
	latterHandler: AnyFunction | undefined
) => {
	const mergedEventHandler = (event: unknown) => {
		if (isSyntheticEvent(event)) {
			const result = latterHandler?.(event) as unknown;

			if (!event.defaultPrevented) {
				formerHandler?.(event);
			}

			return result;
		}

		const result = latterHandler?.(event) as unknown;
		formerHandler?.(event);
		return result;
	};

	return mergedEventHandler;
};

export const composeEventHandlers = (...eventHandlerArray: Array<AnyFunction | undefined>) => {
	const mergedEventHandler = (event: unknown) => {
		if (eventHandlerArray.length === 0) return;

		if (eventHandlerArray.length === 1) {
			return eventHandlerArray[0]?.(event) as unknown;
		}

		let accumulatedHandlers: AnyFunction | undefined;

		for (const eventHandler of eventHandlerArray) {
			if (!eventHandler) continue;

			accumulatedHandlers = composeTwoEventHandlers(accumulatedHandlers, eventHandler);
		}

		return accumulatedHandlers?.(event) as unknown;
	};

	return mergedEventHandler;
};
