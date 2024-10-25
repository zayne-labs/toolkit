import { isArray } from "@/type-helpers";
import { isValidElement } from "react";
import { toArray } from "@/core/toArray";

type Noop = () => void;
type WithSlot = { slot?: string };

export const isSlotElement = <TProps>(
	child: React.ReactNode,
	SlotWrapper: React.ComponentType<TProps>
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
	SlotWrapper: React.ComponentType<TProps>,
	options: SlotOptions = {}
) => {
	const {
		errorMessage = "Only one instance of the SlotComponent is allowed",
		throwOnMultipleSlotMatch = false,
	} = options;

	const childrenArray = toArray<React.ReactNode>(children);

	const Slot = childrenArray.filter((child) => isSlotElement(child, SlotWrapper));

	if (throwOnMultipleSlotMatch && Slot.length > 1) {
		throw new Error(errorMessage);
	}

	return Slot[0] as React.ReactElement<TProps> | undefined;
};

const isSlotElementMultiple = <TProps>(
	child: React.ReactNode,
	SlotWrapperArray: Array<React.ComponentType<TProps>>
) => SlotWrapperArray.some((slotWrapper) => isSlotElement(child, slotWrapper));

// Check if the child is a Slot element by matching any in the SlotWrapperArray
export const getOtherChildren = <TProps>(
	children: React.ReactNode,
	SlotWrapperOrWrappers: Array<React.ComponentType<TProps>> | React.ComponentType<TProps>
) => {
	const childrenArray = isArray<React.ReactNode>(children) ? children : [children];

	const otherChildren = isArray(SlotWrapperOrWrappers)
		? childrenArray.filter((child) => !isSlotElementMultiple(child, SlotWrapperOrWrappers))
		: childrenArray.filter((child) => !isSlotElement(child, SlotWrapperOrWrappers));

	return otherChildren;
};
