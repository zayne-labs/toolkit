import { toArray } from "@zayne-labs/toolkit-core";
import { type AnyFunction, AssertionError, type EmptyObject } from "@zayne-labs/toolkit-type-helpers";
import { isValidElement } from "react";

type FunctionalComponent<TProps = EmptyObject> = (
	props: TProps
	// eslint-disable-next-line perfectionist/sort-union-types -- Lets keep the first one first
) => ReturnType<React.FunctionComponent<TProps>> | AnyFunction<React.ReactNode>;

// TODO - Add support for thing like <div slot="foo"> OR <Slot name="foo">
/**
 * @description Checks if a React node is a slot component using multiple matching strategies:
 * 1. Matches by slot symbol property
 * 2. Matches by direct component reference
 * 3. Matches by stringified component
 * 4. Matches by component name
 */
export const isSlot = <TProps>(child: React.ReactNode, SlotComponent: FunctionalComponent<TProps>) => {
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
 * @description Counts how many times a slot component appears in an array of children
 * @internal
 */
const calculateSlotOccurrences = (
	childrenArray: React.ReactNode[],
	SlotComponent: FunctionalComponent
) => {
	let count = 0;

	for (const child of childrenArray) {
		if (!isSlot(child, SlotComponent)) continue;

		count += 1;
	}

	return count;
};

/**
 * @description Retrieves a single slot element from a collection of React children that matches the provided SlotComponent component.
 *
 * @throws { AssertionError } when throwOnMultipleSlotMatch is true and multiple slots are found
 */
export const getSingleSlot = (
	children: React.ReactNode,
	SlotComponent: FunctionalComponent,
	options: SlotOptions = {}
) => {
	const {
		errorMessage = "Only one instance of the SlotComponent is allowed",
		throwOnMultipleSlotMatch = false,
	} = options;

	const childrenArray = toArray<React.ReactNode>(children);

	const shouldThrow =
		throwOnMultipleSlotMatch && calculateSlotOccurrences(childrenArray, SlotComponent) > 1;

	if (shouldThrow) {
		throw new AssertionError(errorMessage);
	}

	const slotElement = childrenArray.find((child) => isSlot(child, SlotComponent));

	return slotElement;
};

// NOTE -  You can imitate const type parameter by extending readonly[] | []

export const getMultipleSlots = <const TSlotComponents extends FunctionalComponent[]>(
	children: React.ReactNode,
	SlotComponents: TSlotComponents,
	options?: SlotOptions
) => {
	type SlotsType = { [Key in keyof TSlotComponents]: ReturnType<TSlotComponents[Key]> };

	const slots = SlotComponents.map((SlotComponent) =>
		getSingleSlot(children, SlotComponent, options)
	) as SlotsType;

	const otherChildren = getOtherChildren(children, SlotComponents);

	return { otherChildren, slots };
};

/**
 * @description Returns all children that are not slot elements (i.e., don't match any of the provided slot components)
 */
export const getOtherChildren = (children: React.ReactNode, SlotComponents: FunctionalComponent[]) => {
	const childrenArray = toArray<React.ReactNode>(children);

	const otherChildren = childrenArray.filter(
		(child) => !SlotComponents.some((SlotComponent) => isSlot(child, SlotComponent))
	);

	return otherChildren;
};
