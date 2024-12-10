import { checkIsDeviceMobileOrTablet, off, on } from "@/core";
import { cnMerge } from "@/core/cn";
import { useRef } from "react";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import type { RefCallback } from "../../utils/types";

/* eslint-disable no-param-reassign */
const updateCursor = <TElement extends HTMLElement>(element: TElement) => {
	element.style.cursor = "grabbing";
	element.style.userSelect = "none";
};

const onScrollSnap = <TElement extends HTMLElement>(action: "remove" | "reset", element: TElement) => {
	if (action === "remove") {
		element.style.scrollSnapType = "none";
		return;
	}

	element.style.scrollSnapType = "";
};

const handleScrollSnap = (dragContainer: HTMLElement) => {
	const isMobileOrTablet = checkIsDeviceMobileOrTablet();

	if (!isMobileOrTablet) {
		onScrollSnap("remove", dragContainer);
	} else {
		onScrollSnap("reset", dragContainer);
	}
};

const resetCursor = <TElement extends HTMLElement>(element: TElement) => {
	element.style.cursor = "";
	element.style.userSelect = "";
};

type DragScrollProps = {
	classNames?: { base?: string; item?: string };
	orientation?: "both" | "horizontal" | "vertical";
	usage?: "allScreens" | "desktopOnly" | "mobileAndTabletOnly";
};

const useDragScroll = <TElement extends HTMLElement>(props: DragScrollProps = {}) => {
	const { classNames, orientation = "horizontal", usage = "allScreens" } = props;

	const dragContainerRef = useRef<TElement>(null);

	const positionRef = useRef({ left: 0, top: 0, x: 0, y: 0 });

	const handleMouseMove = useCallbackRef((event: MouseEvent) => {
		if (!dragContainerRef.current) return;

		if (orientation === "horizontal" || orientation === "both") {
			// == calculate the current change in the horizontal scroll position based on the difference between the previous mouse position and the new mouse position
			const dx = event.clientX - positionRef.current.x;

			// == Assign the scrollLeft of the container to the difference between its previous horizontal scroll position and the change in the mouse position
			dragContainerRef.current.scrollLeft = positionRef.current.left - dx;
		}

		if (orientation === "vertical" || orientation === "both") {
			// == calculate the current change in the vertical scroll position based on the difference between the previous mouse position and the new mouse position
			const dy = event.clientY - positionRef.current.y;

			// == Assign the scrollTop of the container to the difference between its previous vertical scroll position and the change in the mouse position
			dragContainerRef.current.scrollTop = positionRef.current.top - dy;
		}
	});

	const handleMouseUpOrLeave = useCallbackRef(() => {
		if (!dragContainerRef.current) return;

		off("mousemove", dragContainerRef.current, handleMouseMove);
		off("mouseup", dragContainerRef.current, handleMouseUpOrLeave);
		off("mouseleave", dragContainerRef.current, handleMouseUpOrLeave);

		resetCursor(dragContainerRef.current);
	});

	const handleMouseDown = useCallbackRef((event: MouseEvent) => {
		if (usage === "mobileAndTabletOnly" && window.innerWidth >= 768) return;
		if (usage === "desktopOnly" && window.innerWidth < 768) return;

		if (!dragContainerRef.current) return;

		// == Update all initial position properties stored in the positionRef
		if (orientation === "horizontal" || orientation === "both") {
			positionRef.current.x = event.clientX;
			positionRef.current.left = dragContainerRef.current.scrollLeft;
		}

		if (orientation === "vertical" || orientation === "both") {
			positionRef.current.y = event.clientY;
			positionRef.current.top = dragContainerRef.current.scrollTop;
		}

		updateCursor(dragContainerRef.current);

		on("mousemove", dragContainerRef.current, handleMouseMove);
		on("mouseup", dragContainerRef.current, handleMouseUpOrLeave);
		on("mouseleave", dragContainerRef.current, handleMouseUpOrLeave);
	});

	const refCallBack: RefCallback<TElement> = useCallbackRef((node) => {
		dragContainerRef.current = node;

		node && handleScrollSnap(node);

		const cleanup = on("mousedown", dragContainerRef.current, handleMouseDown);

		// == Run cleanup manually on unmount if the user is using a version of react that doesn't support cleanup
		if (!node) {
			cleanup();
			return;
		}

		return cleanup;
	});

	const getRootProps = () => ({
		className: cnMerge(
			`flex w-full cursor-grab snap-x snap-mandatory overflow-y-clip overflow-x-scroll
			[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`,
			orientation === "horizontal" && "flex-row",
			orientation === "vertical" && "flex-col",
			usage === "mobileAndTabletOnly" && "md:cursor-default md:flex-col",
			usage === "desktopOnly" && "max-md:cursor-default max-md:flex-col",
			classNames?.base
		),
		ref: refCallBack,
	});

	const getItemProps = () => ({
		className: cnMerge("snap-center snap-always", classNames?.item),
	});

	return { getItemProps, getRootProps };
};

export { useDragScroll };
