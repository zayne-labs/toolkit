import type { Prettify } from "@/type-helpers";
import type { useToggle } from "../useToggle";

type UsePresenceOptions<TDuration extends number | undefined> = {
	defaultValue?: boolean;
	/**
	 * @description The duration of the animation or transition
	 */
	duration?: TDuration;
	/**
	 * @description A callback function that will be called when the animation or transition ends
	 */
	onExitComplete?: () => void;
};

type UsePresenceResult<TElement, TDuration> = Prettify<
	(TDuration extends undefined ? { elementRef: React.RefObject<TElement> } : unknown) & {
		isPresent: boolean;
		isVisible: boolean;
		toggleVisibility: ReturnType<typeof useToggle>[1];
	}
>;

export type UseSpecificPresence = <
	TElement extends HTMLElement,
	TDuration extends number | undefined = undefined,
>(
	options?: UsePresenceOptions<TDuration>
) => UsePresenceResult<TElement, TDuration>;

type TypeOption = {
	/**
	 * @description The type of animation, whether animation or transition
	 * @default "transition"
	 */
	type?: "animation" | "transition";
};

export type UsePresence = <TElement extends HTMLElement, TDuration extends number | undefined = undefined>(
	options?: Prettify<TypeOption & UsePresenceOptions<TDuration>>
) => UsePresenceResult<TElement, TDuration>;
