import { toArray } from "@zayne-labs/toolkit-core";
import { type AnyFunction, AssertionError, isArray } from "@zayne-labs/toolkit-type-helpers";
import { isValidElement } from "react";

type FunctionalComponent<TProps> = (
	props: TProps
	// eslint-disable-next-line perfectionist/sort-union-types -- Lets keep the first one first
) => ReturnType<React.FunctionComponent<TProps>> | AnyFunction<React.ReactNode>;

// TODO - Add support for thing like <div slot="foo"> OR <Slot name="foo">
export const isSlotElement = <TProps>(
	child: React.ReactNode,
	SlotComponent: FunctionalComponent<TProps>
) => {
	if (!isValidElement(child)) {
		return false;
	}

	type WithSlot = { slot?: string };

	if ((child.type as WithSlot).slot === (SlotComponent as WithSlot).slot) {
		return true;
	}

	if (child.type === SlotComponent) {
		return true;
	}

	if (child.type.toString() === SlotComponent.toString()) {
		return true;
	}

	return (child.type as FunctionalComponent<TProps>).name === SlotComponent.name;
};

type SlotOptions = {
	errorMessage?: string;
	throwOnMultipleSlotMatch?: boolean;
};

/**
 * @description Retrieves a single slot element from a collection of React children that matches the provided SlotComponent component.
 *
 * @throws {AssertionError} When throwOnMultipleSlotMatch is true and multiple slots are found
 */
export const getSlotElement = <TProps = Record<string, unknown>>(
	children: React.ReactNode,
	SlotComponent: FunctionalComponent<TProps>,
	options: SlotOptions = {}
) => {
	const {
		errorMessage = "Only one instance of the SlotComponent is allowed",
		throwOnMultipleSlotMatch = false,
	} = options;

	const childrenArray = toArray<React.ReactNode>(children);

	const Slot = childrenArray.filter((child) => isSlotElement(child, SlotComponent));

	if (throwOnMultipleSlotMatch && Slot.length > 1) {
		throw new AssertionError(errorMessage);
	}

	return Slot[0] as React.ReactElement<TProps> | undefined;
};

const isSlotElementMultiple = <TProps>(
	child: React.ReactNode,
	SlotComponentArray: Array<FunctionalComponent<TProps>>
) => SlotComponentArray.some((slotComponent) => isSlotElement(child, slotComponent));

// Check if the child is a Slot element by matching any in the SlotComponentArray
export const getOtherChildren = <
	TProps = Record<string, unknown>,
	TChildren extends React.ReactNode = React.ReactNode,
>(
	children: TChildren,
	SlotComponentOrComponents: Array<FunctionalComponent<TProps>> | FunctionalComponent<TProps>
) => {
	const childrenArray = toArray<TChildren>(children);

	const otherChildren = isArray(SlotComponentOrComponents)
		? childrenArray.filter((child) => !isSlotElementMultiple(child, SlotComponentOrComponents))
		: childrenArray.filter((child) => !isSlotElement(child, SlotComponentOrComponents));

	return otherChildren as TChildren extends unknown[] ? TChildren : TChildren[];
};
