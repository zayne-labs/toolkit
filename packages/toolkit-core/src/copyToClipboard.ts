const fallBackCopy = (text: string) => {
	const tempTextArea = document.createElement("textarea");
	tempTextArea.value = text;
	document.body.append(tempTextArea);
	tempTextArea.select();
	// eslint-disable-next-line ts-eslint/no-deprecated -- It's a fallback so the deprecation is fine
	document.execCommand("copy");
	tempTextArea.remove();
};

const copyToClipboard = async (text: string) => {
	if (text === "") return;

	try {
		// eslint-disable-next-line ts-eslint/no-unnecessary-condition -- navigator can be undefined sometimes
		if (!navigator?.clipboard?.writeText) {
			throw new Error("writeText not supported");
		}

		await navigator.clipboard.writeText(text);
	} catch (error) {
		if (error instanceof DOMException && error.name === "NotAllowedError") {
			console.error("Copy to clipboard is not allowed", error.message);
			fallBackCopy(text);

			return;
		}

		console.error("Copy to clipboard failed", error);
		fallBackCopy(text);
	}
};

export { copyToClipboard };
