import { checkIsDeviceMobileOrTablet } from "./checkIsDeviceMobileOrTablet";
import { off, on } from "./on";

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

export type DragScrollOptions = {
	// eslint-disable-next-line ts-eslint/no-explicit-any
	cn?: (...params: any[]) => string;
	dragOrientation?: "both" | "horizontal" | "vertical";
	usage?: "allScreens" | "desktopOnly" | "mobileAndTabletOnly";
};

export const classResolver = (...params: Array<false | string>) => params.filter(Boolean).join(" ");

const createDragScroll = <TElement extends HTMLElement>(
	dragContainer: TElement | null,
	options: DragScrollOptions = {}
) => {
	if (!dragContainer) {
		console.error(
			"createDragScroll:",
			`dragContainer element returned ${dragContainer}, which is invalid`
		);

		return;
	}

	const { cn = classResolver, dragOrientation = "horizontal", usage = "allScreens" } = options;

	const positionObject = { left: 0, top: 0, x: 0, y: 0 };

	const handleMouseMove = (event: MouseEvent) => {
		if (dragOrientation === "horizontal" || dragOrientation === "both") {
			// == calculate the current change in the horizontal scroll position based on the difference between the previous mouse position and the new mouse position
			const dx = event.clientX - positionObject.x;

			// == Assign the scrollLeft of the container to the difference between its previous horizontal scroll position and the change in the mouse position
			dragContainer.scrollLeft = positionObject.left - dx;
		}

		if (dragOrientation === "vertical" || dragOrientation === "both") {
			// == calculate the current change in the vertical scroll position based on the difference between the previous mouse position and the new mouse position
			const dy = event.clientY - positionObject.y;

			// == Assign the scrollTop of the container to the difference between its previous vertical scroll position and the change in the mouse position
			dragContainer.scrollTop = positionObject.top - dy;
		}
	};

	const handleMouseUpOrLeave = () => {
		off("mousemove", dragContainer, handleMouseMove);
		off("mouseup", dragContainer, handleMouseUpOrLeave);
		off("mouseleave", dragContainer, handleMouseUpOrLeave);

		resetCursor(dragContainer);
	};

	const handleMouseDown = (event: MouseEvent) => {
		if (usage === "mobileAndTabletOnly" && window.innerWidth >= 768) return;
		if (usage === "desktopOnly" && window.innerWidth < 768) return;

		// == Update all initial position properties stored in the positionRef
		if (dragOrientation === "horizontal" || dragOrientation === "both") {
			positionObject.x = event.clientX;
			positionObject.left = dragContainer.scrollLeft;
		}

		if (dragOrientation === "vertical" || dragOrientation === "both") {
			positionObject.y = event.clientY;
			positionObject.top = dragContainer.scrollTop;
		}

		updateCursor(dragContainer);

		on("mousemove", dragContainer, handleMouseMove);
		on("mouseup", dragContainer, handleMouseUpOrLeave);
		on("mouseleave", dragContainer, handleMouseUpOrLeave);
	};

	handleScrollSnap(dragContainer);

	const cleanupFn = on("mousedown", dragContainer, handleMouseDown);

	const dragContainerClasses = cn(
		"flex w-full cursor-grab snap-x snap-mandatory overflow-y-clip overflow-x-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
		dragOrientation === "horizontal" && "w-full flex-row",
		dragOrientation === "vertical" && "flex-col",
		usage === "mobileAndTabletOnly" && "md:cursor-default md:flex-col",
		usage === "desktopOnly" && "max-md:cursor-default max-md:flex-col"
	);

	const dragItemClasses = "snap-center snap-always";

	return { cleanupFn, dragContainerClasses, dragItemClasses };
};

export { createDragScroll };
