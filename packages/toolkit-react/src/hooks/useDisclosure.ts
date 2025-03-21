import { lockScroll } from "@zayne-labs/toolkit-core";
import { useCallbackRef } from "./useCallbackRef";
import { useToggle } from "./useToggle";

type DisclosureOptions = {
	hasScrollControl?: boolean;
	initialState?: boolean | (() => boolean);
};

const useDisclosure = (options: DisclosureOptions = {}) => {
	const { hasScrollControl = false, initialState = false } = options;
	const [isOpen, toggleIsOpen] = useToggle(initialState);

	const handleScrollControl = useCallbackRef(
		(state: boolean) => hasScrollControl && lockScroll({ isActive: state })
	);

	const onOpen = useCallbackRef(<TValue>(value?: TValue) => {
		const booleanValue = typeof value === "boolean" && value ? value : true;
		toggleIsOpen(booleanValue);
		handleScrollControl(booleanValue);
	});

	const onClose = useCallbackRef(<TValue>(value?: TValue) => {
		const booleanValue = typeof value === "boolean" && !value ? value : false;

		toggleIsOpen(booleanValue);
		handleScrollControl(booleanValue);
	});

	const onToggle = useCallbackRef(<TValue>(value?: TValue) => {
		if (typeof value === "boolean") {
			value ? onOpen(value) : onClose(value);
			return;
		}

		isOpen ? onClose() : onOpen();
	});

	return { isOpen, onClose, onOpen, onToggle };
};

export { useDisclosure };
