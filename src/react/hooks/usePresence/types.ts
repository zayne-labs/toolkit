import type { Prettify } from "@/type-helpers";
import type { useToggle } from "../useToggle";

type GetTypeProp<THasType extends boolean> = {
	_: THasType extends true
		? {
				/**
				 * @description The type of animation, whether animation or transition
				 * @default "transition"
				 */
				type?: "animation" | "transition";
			}
		: unknown;
}["_"];

type UsePresenceOptions<TDuration extends number | undefined, THasType extends boolean> = Prettify<
	GetTypeProp<THasType> & {
		/**
		 * @description The duration of the animation or transition
		 */
		duration?: TDuration;
		/**
		 * @description A callback function that will be called when the animation or transition ends
		 */
		onExitComplete?: () => void;
	}
>;

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
	defaultValue?: boolean,
	options?: UsePresenceOptions<TDuration, false>
) => UsePresenceResult<TElement, TDuration>;

export type UsePresence = <TElement extends HTMLElement, TDuration extends number | undefined = undefined>(
	defaultValue?: boolean,
	options?: UsePresenceOptions<TDuration, true>
) => UsePresenceResult<TElement, TDuration>;
