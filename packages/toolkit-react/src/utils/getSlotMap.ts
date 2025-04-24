import { toArray } from "@zayne-labs/toolkit-core";
import type { UnionToIntersection, UnknownObject } from "@zayne-labs/toolkit-type-helpers";
import { Fragment as ReactFragment, isValidElement } from "react";
import type { InferProps } from "./types";

/**
 * Maps slot names to their corresponding children types
 */
type GetSlotMapResult<TSlotComponentProps extends GetSlotComponentProps> = UnionToIntersection<{
	[TName in keyof TSlotComponentProps as TSlotComponentProps["name"]]: TSlotComponentProps["children"];
}>;

/**
 * Symbol used to identify SlotComponent instances
 */
export const slotComponentSymbol = Symbol("slot-component");

/**
 * @description Creates a map of named slots from React children. Returns an object mapping slot names to their children,
 * with a default slot for unmatched children.
 *
 * @example
 * ```tsx
 * import { type GetSlotComponentProps, SlotComponent } from "@zayne-labs/toolkit-react/utils"
 *
 * type SlotProps = GetSlotComponentProps<"header" | "footer">;
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
 * ```
 *
 * Usage:
 * ```tsx
 * <Parent>
 *   <SlotComponent name="header">Header Content</SlotComponent>
 *   <div>Random stuff</div>
 *   <SlotComponent name="footer">Footer Content</SlotComponent>
 * </Parent>
 * ```
 */
export const getSlotMap = <TSlotComponentProps extends GetSlotComponentProps>(
	children: React.ReactNode
) => {
	const actualChildren =
		isValidElement<InferProps<typeof ReactFragment>>(children) && children.type === ReactFragment
			? children.props.children
			: children;

	const childrenArray = toArray<React.ReactNode>(actualChildren);

	const slots: Record<string, React.ReactNode> & { default: React.ReactNode[] } = { default: [] };

	for (const child of childrenArray) {
		type SlotElementProps = TSlotComponentProps & { "data-slot-name": never };

		type RegularElementProps = Pick<TSlotComponentProps, "children"> & {
			"data-slot-name": string;
			name: never;
		};

		const isSlotElementWithName =
			isValidElement<SlotElementProps>(child)
			&& (child.type as SlotComponentType).slotSymbol === slotComponentSymbol
			&& Boolean((child.type as WithSlotSymbolAndName).slotName ?? child.props.name);

		const isRegularElementWithSlotName =
			isValidElement<RegularElementProps>(child) && Boolean(child.props["data-slot-name"]);

		if (!isSlotElementWithName && !isRegularElementWithSlotName) {
			slots.default.push(child);
			continue;
		}

		const slotName = isSlotElementWithName
			? ((child.type as WithSlotSymbolAndName).slotName ?? child.props.name)
			: child.props["data-slot-name"];

		slots[slotName] = child.props.children;
	}

	return slots as GetSlotMapResult<TSlotComponentProps> & { default: React.ReactNode[] };
};

/**
 * @description Produce props for the SlotComponent
 */
export type GetSlotComponentProps<
	TName extends string = string,
	TChildren extends React.ReactNode = React.ReactNode,
> = {
	/** Content to render in the slot */
	children: TChildren;
	/** Name of the slot where content should be rendered */
	name: TName;
};

/**
 * @description Slot component created by createSlotComponent
 */

export const createSlotComponent = <TSlotComponentProps extends GetSlotComponentProps>() => {
	const SlotComponent = (props: TSlotComponentProps) => props.children;

	SlotComponent.slotSymbol = slotComponentSymbol;

	return SlotComponent;
};

type SlotComponentType = ReturnType<typeof createSlotComponent>;

type WithSlotSymbolAndName<
	TSlotComponentProps extends Pick<GetSlotComponentProps, "name"> = Pick<GetSlotComponentProps, "name">,
	TActualProps extends UnknownObject = UnknownObject,
> = {
	(props: Pick<GetSlotComponentProps, "children"> & TActualProps): React.ReactNode;
	slotName?: TSlotComponentProps["name"];
	slotSymbol?: typeof slotComponentSymbol;
};

export const withSlotSymbolAndName = <
	TSlotComponentProps extends Pick<GetSlotComponentProps, "name">,
	TActualProps extends UnknownObject = UnknownObject,
>(
	name: TSlotComponentProps["name"],
	SlotComponent: WithSlotSymbolAndName<TSlotComponentProps, TActualProps>
) => {
	/* eslint-disable no-param-reassign -- This is necessary */
	SlotComponent.slotSymbol = slotComponentSymbol;
	SlotComponent.slotName = name;
	/* eslint-enable no-param-reassign -- This is necessary */

	return SlotComponent;
};
