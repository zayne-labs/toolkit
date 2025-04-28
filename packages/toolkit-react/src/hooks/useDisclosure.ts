import { lockScroll } from "@zayne-labs/toolkit-core";
import { isBoolean } from "@zayne-labs/toolkit-type-helpers";
import { useCallbackRef } from "./useCallbackRef";
import { useToggle } from "./useToggle";

type DisclosureOptions = {
	hasScrollControl?: boolean;
	initialState?: boolean | (() => boolean);
};

const useDisclosure = (options: DisclosureOptions = {}) => {
	const { hasScrollControl = false, initialState = false } = options;
	const [isOpen, toggleIsOpen] = useToggle(initialState);

	const onOpen = useCallbackRef(() => {
		toggleIsOpen(true);
		hasScrollControl && lockScroll({ lock: true });
	});

	const onClose = useCallbackRef(() => {
		toggleIsOpen(false);
		hasScrollControl && lockScroll({ lock: false });
	});

	const onToggle = useCallbackRef(<TValue>(value?: TValue) => {
		if (isBoolean(value)) {
			toggleIsOpen(value);
			hasScrollControl && lockScroll({ lock: value });
			return;
		}

		isOpen ? onClose() : onOpen();
	});

	return { isOpen, onClose, onOpen, onToggle };
};
export { useDisclosure };
