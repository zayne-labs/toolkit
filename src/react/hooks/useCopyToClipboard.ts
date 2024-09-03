import { copyToClipboard } from "@/core";
import { useState } from "react";

const useCopyToClipboard = () => {
	const [state, setState] = useState("");

	const handleCopy = (value: string) => {
		setState(value);
		void copyToClipboard(value);
	};

	return { copiedValue: state, handleCopy };
};

export { useCopyToClipboard };
