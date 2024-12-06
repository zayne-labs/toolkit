"use client";

import { getSlotElement } from "@/react/utils";
import { isArray } from "@/type-helpers";

type ValidSwitchComponentType = React.ReactElement<SwitchMatchProps>;

type SwitchProps<TCondition> = {
	children: ValidSwitchComponentType | ValidSwitchComponentType[];
	condition?: TCondition;
};

type SwitchMatchProps<TWhen = boolean> = {
	children: React.ReactNode;
	when: TWhen;
};

function Switch<TCondition = true>(props: SwitchProps<TCondition>) {
	const { children, condition = true } = props;

	const defaultCase = getSlotElement(children, Default, {
		errorMessage: "Only one <Switch.Default> component is allowed",
		throwOnMultipleSlotMatch: true,
	});

	const childrenCasesArray = isArray(children) ? children : [children];

	const matchedCase = childrenCasesArray.find((child) => child.props.when === condition);

	return matchedCase ?? defaultCase;
}

export function Match<TWhen>({ children }: SwitchMatchProps<TWhen>) {
	return children;
}

export function Default({ children }: Pick<SwitchMatchProps, "children">) {
	return children;
}
Default.slot = Symbol.for("fallback");

Switch.Match = Match;
Switch.Default = Default;

export { Switch };