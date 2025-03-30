import { toArray } from "@zayne-labs/toolkit-core";
import type { AnyFunction, UnionToIntersection } from "@zayne-labs/toolkit-type-helpers";
import { isValidElement } from "react";

/**
 * Possible children types that can be passed to a slot
 */
type PossibleSlotChildrenType =
	| AnyFunction<React.ReactNode | React.ReactNode[]>
	| React.ReactNode
	| React.ReactNode[];

/**
 * Maps slot names to their corresponding children types
 */
type GetSlotMap<TSlotComponentProps extends GetSlotComponentProps> = UnionToIntersection<{
	[TName in keyof TSlotComponentProps as TSlotComponentProps["name"]]: TSlotComponentProps["children"];
}>;

/**
 * Symbol used to identify SlotComponent instances
 */
export const slotComponentSymbol = Symbol("SlotComponent");

type GetSlotMapOptions = {
	/**
	 * @description When true, only accepts slots from components with the SlotComponent symbol
	 */
	onlyAllowNamePropFromSlotComponent?: boolean;
};

/**
 * @description Creates a map of named slots from React children. Returns an object mapping slot names to their children,
 * with a default slot for unmatched children.
 *
 * @example
 * ```tsx
 * type SlotProps = GetSlotComponentProps<"header" | "footer">;
 *
 * function ParentComponent({ children }: { children: React.ReactNode }) {
 *   const slots = getSlotMap<SlotProps>(children);
 *
 *   return (
 *     <div>
 *       <header>{slots.header}</header>
 *       <main>{slots.default}</main>
 *       <footer>{slots.footer}</footer>
 *     </div>
 *   );
 * }
 * ```
 */
export const getSlotMap = <TSlotComponentProps extends GetSlotComponentProps>(
	children: React.ReactNode,
	options: GetSlotMapOptions = {}
) => {
	const { onlyAllowNamePropFromSlotComponent = false } = options;

	const childrenArray = toArray<React.ReactNode>(children);

	const slots: Record<string, PossibleSlotChildrenType> & { default: React.ReactNode[] } = {
		default: [],
	};

	type WithSlot = { slot?: typeof slotComponentSymbol };

	for (const child of childrenArray) {
		const shouldPushToDefault =
			!isValidElement<TSlotComponentProps>(child)
			|| !child.props.name
			|| (onlyAllowNamePropFromSlotComponent && (child.type as WithSlot).slot !== slotComponentSymbol);

		if (shouldPushToDefault) {
			slots.default.push(child);
			continue;
		}

		slots[child.props.name] = child.props.children;
	}

	return slots as GetSlotMap<TSlotComponentProps> & { default: React.ReactNode[] };
};

/**
 * @description Produce props for the SlotComponent
 */
export type GetSlotComponentProps<
	TName extends string = string,
	TChildren extends PossibleSlotChildrenType = PossibleSlotChildrenType,
> = {
	/** Content to render in the slot */
	children: TChildren;
	/** Name of the slot where content should be rendered */
	name: TName;
};

/**
 * @description Function used to create a slot component that defines named slots in a parent component. This component created doesn't render anything,
 * it's used purely for slot definition.
 *
 * @example
 * ```tsx
 * const SlotProps = GetSlotComponentProps<"header" | "footer">;
 *
 * function Parent({ children }: { children: React.ReactNode }) {
 *   const slots = getSlotMap<SlotProps>(children);
 *
 *   return (
 *     <div>
 *       <header>{slots.header}</header>
 *       <main>{slots.default}</main>
 *       <footer>{slots.footer}</footer>
 *     </div>
 *   );
 * }
 *
 * Parent.Slot = createSlotComponent<SlotProps>();
 *
 * function App() {
 *   return (
 *     <Parent>
 *       <Parent.Slot name="header">Header Content</Parent.Slot>
 *       <div>Default Content</div>
 *       <Parent.Slot name="footer">Footer Content</Parent.Slot>
 *     </Parent>
 *   );
 * }
 * ```
 */

export const createSlotComponent = <TBaseSlotComponentProps extends GetSlotComponentProps>() => {
	function SlotComponent<TSlotComponentProps extends TBaseSlotComponentProps>(
		// eslint-disable-next-line ts-eslint/no-unused-vars -- The props here are just for type definition really, as this component doesn't need to render anything
		props: TSlotComponentProps
	) {
		return null as React.ReactNode;
	}

	SlotComponent.slot = slotComponentSymbol;

	return SlotComponent;
};

/**
 * @description Slot component created by createSlotComponent
 */
export const SlotComponent = createSlotComponent();
