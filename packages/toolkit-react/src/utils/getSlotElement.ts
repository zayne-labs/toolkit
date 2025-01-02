import { toArray } from "@zayne-labs/toolkit-core";
import { AssertionError, isArray } from "@zayne-labs/toolkit-type-helpers";
import { isValidElement } from "react";

type Noop = () => void;
type WithSlot = { slot?: string };

export const isSlotElement = <TProps>(
	child: React.ReactNode,
	SlotWrapper: React.FunctionComponent<TProps>
) => {
	if (!isValidElement(child)) {
		return false;
	}

	if ((child.type as WithSlot).slot === (SlotWrapper as WithSlot).slot) {
		return true;
	}

	if ((child.type as Noop).name === (SlotWrapper as Noop).name) {
		return true;
	}

	if (child.type === SlotWrapper) {
		return true;
	}

	return child.type.toString() === SlotWrapper.toString();
};

type SlotOptions = {
	errorMessage?: string;
	throwOnMultipleSlotMatch?: boolean;
};

export const getSlotElement = <TProps>(
	children: React.ReactNode,
	SlotWrapper: React.FunctionComponent<TProps>,
	options: SlotOptions = {}
) => {
	const {
		errorMessage = "Only one instance of the SlotComponent is allowed",
		throwOnMultipleSlotMatch = false,
	} = options;

	const childrenArray = toArray<React.ReactNode>(children);

	const Slot = childrenArray.filter((child) => isSlotElement(child, SlotWrapper));

	if (throwOnMultipleSlotMatch && Slot.length > 1) {
		throw new AssertionError(errorMessage);
	}

	return Slot[0] as React.ReactElement<TProps> | undefined;
};

const isSlotElementMultiple = <TProps>(
	child: React.ReactNode,
	SlotWrapperArray: Array<React.FunctionComponent<TProps>>
) => SlotWrapperArray.some((slotWrapper) => isSlotElement(child, slotWrapper));

// Check if the child is a Slot element by matching any in the SlotWrapperArray
export const getOtherChildren = <TProps, TChildren extends React.ReactNode = React.ReactNode>(
	children: TChildren,
	SlotWrapperOrWrappers: Array<React.FunctionComponent<TProps>> | React.FunctionComponent<TProps>
) => {
	const childrenArray = toArray<TChildren>(children);

	const otherChildren = isArray(SlotWrapperOrWrappers)
		? childrenArray.filter((child) => !isSlotElementMultiple(child, SlotWrapperOrWrappers))
		: childrenArray.filter((child) => !isSlotElement(child, SlotWrapperOrWrappers));

	return otherChildren as TChildren extends unknown[] ? TChildren : TChildren[];
};
