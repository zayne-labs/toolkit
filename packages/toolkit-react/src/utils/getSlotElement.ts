import { toArray } from "@zayne-labs/toolkit-core";
import { AssertionError, type UnknownObject } from "@zayne-labs/toolkit-type-helpers";
import { isValidElement } from "react";

export type FunctionalComponent<TProps extends UnknownObject = never> = React.FunctionComponent<TProps>;

/**
 * @description Checks if a react child (within the children array) matches the provided SlotComponent using multiple matching strategies:
 * 1. Matches by direct component reference
 * 2. Matches by slot symbol property
 * 3. Matches by stringified component
 * 4. Matches by component name
 */
export const matchesSlotComponent = (child: React.ReactNode, SlotComponent: FunctionalComponent) => {
	if (!isValidElement(child)) {
		return false;
	}

	if (child.type === SlotComponent) {
		return true;
	}

	type WithSlot = { readonly slotSymbol?: unique symbol };

	if ((child.type as WithSlot).slotSymbol === (SlotComponent as WithSlot).slotSymbol) {
		return true;
	}

	if ((child.type as FunctionalComponent).name === SlotComponent.name) {
		return true;
	}

	return child.type.toString() === SlotComponent.toString();
};

/**
 * @description Checks if a react child (within the children array) matches any of the provided SlotComponents.
 */
export const matchesAnySlotComponent = (child: React.ReactNode, SlotComponents: FunctionalComponent[]) => {
	const matchesSlot = SlotComponents.some((SlotComponent) => matchesSlotComponent(child, SlotComponent));

	return matchesSlot;
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
		if (!matchesSlotComponent(child, SlotComponent)) continue;

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

	const slotElement = childrenArray.find((child) => matchesSlotComponent(child, SlotComponent));

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

	const regularChildren = getRegularChildren(children, SlotComponents);

	return { regularChildren, slots };
};

/**
 * @description Returns all children that are not slot elements (i.e., don't match any of the provided slot components)
 */
export const getRegularChildren = <TChildren extends React.ReactNode>(
	children: TChildren,
	SlotComponentOrComponents: FunctionalComponent | FunctionalComponent[]
) => {
	const childrenArray = toArray<React.ReactNode>(children);

	const regularChildren = childrenArray.filter(
		(child) => !matchesAnySlotComponent(child, toArray(SlotComponentOrComponents))
	);

	return regularChildren as TChildren extends unknown[] ? TChildren : TChildren[];
};
