import { checkIsDeviceMobileOrTablet, off, on } from "@/core";
import { useRef } from "react";
import { useEffectOnce } from "./effects";
import { useCallbackRef } from "./useCallbackRef";

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

const classResolver = (...params: Array<false | string>) => params.filter(Boolean).join(" ");

type DragScrollOptions = {
	// eslint-disable-next-line ts-eslint/no-explicit-any
	cn?: (...params: any[]) => string;
	dragOrientation?: "both" | "horizontal" | "vertical";
	usage?: "allScreens" | "desktopOnly" | "mobileAndTabletOnly";
};

const useDragScroll = <TElement extends HTMLElement>(options: DragScrollOptions = {}) => {
	const { cn = classResolver, dragOrientation = "horizontal", usage = "allScreens" } = options;

	const dragContainerRef = useRef<TElement>(null);
	const positionRef = useRef({ left: 0, top: 0, x: 0, y: 0 });

	const handleMouseMove = useCallbackRef((event: MouseEvent) => {
		if (!dragContainerRef.current) return;

		if (dragOrientation === "horizontal" || dragOrientation === "both") {
			// == calculate the current change in the horizontal scroll position based on the difference between the previous mouse position and the new mouse position
			const dx = event.clientX - positionRef.current.x;

			// == Assign the scrollLeft of the container to the difference between its previous horizontal scroll position and the change in the mouse position
			dragContainerRef.current.scrollLeft = positionRef.current.left - dx;
		}

		if (dragOrientation === "vertical" || dragOrientation === "both") {
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
		if (dragOrientation === "horizontal" || dragOrientation === "both") {
			positionRef.current.x = event.clientX;
			positionRef.current.left = dragContainerRef.current.scrollLeft;
		}

		if (dragOrientation === "vertical" || dragOrientation === "both") {
			positionRef.current.y = event.clientY;
			positionRef.current.top = dragContainerRef.current.scrollTop;
		}

		updateCursor(dragContainerRef.current);

		on("mousemove", dragContainerRef.current, handleMouseMove);
		on("mouseup", dragContainerRef.current, handleMouseUpOrLeave);
		on("mouseleave", dragContainerRef.current, handleMouseUpOrLeave);
	});

	// TODO - Change to callback ref node in future
	useEffectOnce(() => {
		if (!dragContainerRef.current) return;

		handleScrollSnap(dragContainerRef.current);

		const cleanup = on("mousedown", dragContainerRef.current, handleMouseDown);

		return cleanup;
	});

	const dragScrollProps = {
		ref: dragContainerRef,
	};

	const dragContainerClasses = cn(
		"flex w-full cursor-grab snap-x snap-mandatory overflow-y-clip overflow-x-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
		dragOrientation === "horizontal" && "w-full flex-row",
		dragOrientation === "vertical" && "flex-col",
		usage === "mobileAndTabletOnly" && "md:cursor-default md:flex-col",
		usage === "desktopOnly" && "max-md:cursor-default max-md:flex-col"
	);

	const dragItemClasses = "snap-center snap-always";

	return { dragContainerClasses, dragItemClasses, dragScrollProps };
};

export { useDragScroll };
