const checkIsDeviceMobileOrTablet = (): boolean => {
	const deviceHasMouse = window.matchMedia("(pointer:fine)").matches;
	const deviceHasNoMouse = window.matchMedia("(pointer:coarse)").matches;

	switch (true) {
		case deviceHasMouse: {
			return false;
		}

		case deviceHasNoMouse: {
			return true;
		}

		case "ontouchstart" in window && "maxTouchPoints" in navigator: {
			return navigator.maxTouchPoints > 0;
		}

		case "userAgentData" in navigator && (navigator.userAgentData as { mobile: boolean }).mobile: {
			return true;
		}

		default: {
			const mobileDeviceRegex = /android|webos|iphone|ipad|ipod|blackberry|mobi|iemobile|opera mini/i;

			return mobileDeviceRegex.test(navigator.userAgent);
		}
	}
};

export { checkIsDeviceMobileOrTablet };
