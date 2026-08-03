import { isBoolean } from "@zayne-labs/toolkit-type-helpers";
import { useMemo } from "react";
import { useCallbackRef } from "./useCallbackRef";
import { useScrollLock } from "./useScrollLock";
import { useToggle } from "./useToggle";

type DisclosureOptions = {
	hasScrollControl?: boolean;
	initialState?: boolean | (() => boolean);
};

const useDisclosure = (options: DisclosureOptions = {}) => {
	const { hasScrollControl = false, initialState = false } = options;
	const [isOpen, toggleIsOpen] = useToggle(initialState);
	const { ref: scrollLockRef } = useScrollLock({ enabled: hasScrollControl && isOpen });

	const onOpen = useCallbackRef(() => {
		toggleIsOpen(true);
	});

	const onClose = useCallbackRef(() => {
		toggleIsOpen(false);
	});

	const onToggle = useCallbackRef(<TValue>(value?: TValue) => {
		if (isBoolean(value)) {
			toggleIsOpen(value);
			return;
		}

		isOpen ? onClose() : onOpen();
	});

	const api = useMemo(
		() => ({ isOpen, onClose, onOpen, onToggle, scrollLockRef }),
		[isOpen, onClose, onOpen, onToggle, scrollLockRef]
	);

	return api;
};
export { useDisclosure };
