import { toArray } from "@zayne-labs/toolkit-core";
import type { AnyFunction, UnionToIntersection } from "@zayne-labs/toolkit-type-helpers";
import { isValidElement } from "react";

type PossibleSlotChildrenType =
	| AnyFunction<React.ReactNode | React.ReactNode[]>
	| React.ReactNode
	| React.ReactNode[];

type GetSlotMap<TSlotComponentProps extends GetSlotComponentProps> = UnionToIntersection<{
	[TName in keyof TSlotComponentProps as TSlotComponentProps["name"]]: TSlotComponentProps["children"];
}>;

export const slotComponentSymbol = Symbol("SlotComponent");

type GetSlotMapOptions = {
	onlyAllowNamePropFromSlotComponent?: boolean;
};

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

export type GetSlotComponentProps<
	TName extends string = string,
	TChildren extends PossibleSlotChildrenType = PossibleSlotChildrenType,
> = {
	children: TChildren;
	name: TName;
};

export const SlotComponent = <TSlotComponentProps extends GetSlotMap<GetSlotComponentProps>>(
	// eslint-disable-next-line ts-eslint/no-unused-vars -- The props here are just for type definition really, as this component doesn't need to render anything
	props: TSlotComponentProps
) => {
	return null as React.ReactNode;
};

SlotComponent.slot = slotComponentSymbol;
