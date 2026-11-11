import { mergeTwoObjects, type MergeValueFn } from "@zayne-labs/toolkit-core";
import {
	isFunction,
	isObject,
	isString,
	type UnknownObjectWithAnyKey,
} from "@zayne-labs/toolkit-type-helpers";
import { cnMerge } from "@/lib/utils/cn";
import { composeTwoEventHandlers } from "../composeEventHandlers";
import { isEventHandler } from "./utils";

const mergePropValue: MergeValueFn = (propName, accumulatedPropValue, latterPropValue) => {
	if (
		(propName === "className" || propName === "class")
		&& isString(latterPropValue)
		&& isString(accumulatedPropValue)
	) {
		return cnMerge(accumulatedPropValue, latterPropValue);
	}

	if (propName === "style" && isObject(latterPropValue) && isObject(accumulatedPropValue)) {
		return { ...accumulatedPropValue, ...latterPropValue };
	}

	if (isFunction(latterPropValue) && isFunction(accumulatedPropValue) && isEventHandler(propName)) {
		return composeTwoEventHandlers(accumulatedPropValue, latterPropValue);
	}

	// == latterProps override by default (`undefined` values are already skipped by `mergeTwoObjects`)
	return latterPropValue;
};

export const mergeTwoProps = <TProps extends UnknownObjectWithAnyKey>(
	formerProps: TProps | undefined,
	latterProps: TProps | undefined
): TProps => {
	return mergeTwoObjects(formerProps, latterProps, { mergeValue: mergePropValue });
};
