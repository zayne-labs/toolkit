import { on } from "@zayne-labs/toolkit-core";
import { type NonEmptyArray, isArray } from "@zayne-labs/toolkit-type-helpers";
import { useCallback, useRef } from "react";
import { useCallbackRef } from "./useCallbackRef";

type ElementsInfoArray<TTargetElement extends string> = NonEmptyArray<{
	animationClass: string;
	targetElement: TTargetElement;
}>;

const removeClass = (target: HTMLElement, className: string) => () => target.classList.remove(className);

/**
 * This is a custom React hook that adds and removes animation classes to specified HTML elements.
 * @param elementsInfoArray - An array of objects that contain information about the animation class and the target HTML element.
 * @returns - An object containing the refs of the animated elements and a function to handle the initiation and removal animation.
 */

const useAnimateElementRefs = <TTargetElement extends string>(
	elementsInfoArray: ElementsInfoArray<TTargetElement>
) => {
	const elementsRef = useRef<Record<TTargetElement, HTMLElement | null>>({} as never);

	const addAnimationClasses = useCallbackRef(() => {
		if (!isArray(elementsInfoArray)) {
			console.error("elementsInfo is not an Array");
			return;
		}

		for (const { animationClass, targetElement } of elementsInfoArray) {
			if (!elementsRef.current[targetElement]) {
				console.error("ElementError", `"${targetElement}" element does not exist`);
				return;
			}

			elementsRef.current[targetElement].classList.add(animationClass);
		}
	});

	const removeAnimationClasses = useCallbackRef(() => {
		if (!isArray(elementsInfoArray)) {
			console.error("elementsInfo is not an Array");
			return;
		}

		for (const { animationClass, targetElement } of elementsInfoArray) {
			if (!elementsRef.current[targetElement]) {
				console.error("ElementError", `"${targetElement}" element does not exist`);
				return;
			}

			on(
				"transitionend",
				elementsRef.current[targetElement],
				removeClass(elementsRef.current[targetElement], animationClass)
			);

			on(
				"animationend",
				elementsRef.current[targetElement],
				removeClass(elementsRef.current[targetElement], animationClass)
			);
		}
	});

	// Add animation classes to elements and remove them after the animation ends
	const handleElementsAnimation = useCallback(() => {
		addAnimationClasses();

		removeAnimationClasses();
	}, [addAnimationClasses, removeAnimationClasses]);

	return { animatedElements: elementsRef.current, handleElementsAnimation };
};

export { useAnimateElementRefs };
