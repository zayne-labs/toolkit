import * as React from "react";

import { useEffectOnce, useMountEffect } from "@/react";
import { type AnyString, isString } from "@/type-helpers";
import { useState } from "react";
import { createPortal } from "react-dom";

type ValidHtmlTags = keyof HTMLElementTagNameMap;

type PortalProps = {
	children: React.ReactNode;
	insertPosition?: InsertPosition;
	to?: AnyString | HTMLElement | ValidHtmlTags | null;
};

function Teleport(props: PortalProps) {
	const { children, insertPosition, to } = props;

	const [reactPortal, setReactPortal] = useState<React.ReactPortal | null>(null);

	useEffectOnce(() => {
		if (!to || !insertPosition) return;

		const destination = isString(to) ? document.querySelector<HTMLElement>(to) : to;

		const tempWrapper = document.createElement("div");
		tempWrapper.style.display = "contents";

		destination?.insertAdjacentElement(insertPosition, tempWrapper);

		setReactPortal(createPortal(children, tempWrapper));

		return () => {
			tempWrapper.remove();
		};
	});

	useMountEffect(() => {
		if (!to || insertPosition) return;

		const destination = isString(to) ? document.querySelector<HTMLElement>(to) : to;

		destination && setReactPortal(createPortal(children, destination));
	});

	return reactPortal;
}

export { Teleport };
