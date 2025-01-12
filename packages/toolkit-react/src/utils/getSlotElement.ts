import { toArray } from "@zayne-labs/toolkit-core";
import { type AnyFunction, AssertionError, isArray } from "@zayne-labs/toolkit-type-helpers";
import { isValidElement } from "react";

type Noop = () => void;
type WithSlot = { slot?: string };

type FunctionalComponent<TProps> = (
	props: TProps
	// eslint-disable-next-line perfectionist/sort-union-types -- Lets keep the first one first
) => ReturnType<React.FunctionComponent<TProps>> | AnyFunction<React.ReactNode>;

// TODO - Add support for thing like <div slot="foo"> OR <Slot name="foo">
export const isSlotElement = <TProps>(
	child: React.ReactNode,
	SlotWrapper: FunctionalComponent<TProps>
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
	SlotWrapper: FunctionalComponent<TProps>,
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
	SlotWrapperArray: Array<FunctionalComponent<TProps>>
) => SlotWrapperArray.some((slotWrapper) => isSlotElement(child, slotWrapper));

// Check if the child is a Slot element by matching any in the SlotWrapperArray
export const getOtherChildren = <TProps, TChildren extends React.ReactNode = React.ReactNode>(
	children: TChildren,
	SlotWrapperOrWrappers: Array<FunctionalComponent<TProps>> | FunctionalComponent<TProps>
) => {
	const childrenArray = toArray<TChildren>(children);

	const otherChildren = isArray(SlotWrapperOrWrappers)
		? childrenArray.filter((child) => !isSlotElementMultiple(child, SlotWrapperOrWrappers))
		: childrenArray.filter((child) => !isSlotElement(child, SlotWrapperOrWrappers));

	return otherChildren as TChildren extends unknown[] ? TChildren : TChildren[];
};
