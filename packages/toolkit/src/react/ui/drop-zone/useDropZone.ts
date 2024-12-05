"use client";

import { type FileValidationOptions, handleFileValidation } from "@/core";
import { cnMerge } from "@/core/cn";
import { useCallbackRef, useToggle } from "@/react";
import type { InferProps } from "@/react/util-types";
import { isFunction, isObject } from "@/type-helpers";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";

type RenderProps = {
	acceptedFiles: File[];
	inputRef: React.RefObject<HTMLInputElement>;
	isDragging: boolean;
};

type InputProps = Omit<InferProps<"input">, "children"> & {
	children?: React.ReactNode | ((props: RenderProps) => React.ReactNode);
	classNames?: { activeDrag?: string; base?: string; input?: string };
};

export type DropZoneProps = {
	allowedFileTypes?: string[];

	disableInbuiltValidation?: boolean;

	existingFiles?: File[];

	onUpload?: (details: {
		acceptedFiles: File[];
		event: ChangeEvent<HTMLInputElement> | DragEvent<HTMLDivElement>;
	}) => void;

	onUploadError?: FileValidationOptions["onError"];

	onUploadSuccess?: FileValidationOptions["onSuccess"];

	validationSettings?: {
		disallowDuplicates?: boolean;
		fileLimit?: number;
		maxFileSize?: number;
	};

	validator?: (context: { existingFileArray: File[] | undefined; newFileList: FileList }) => File[];
};

export type UseDropZoneProps = DropZoneProps & InputProps;

const useDropZone = (props: UseDropZoneProps) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const {
		accept,
		allowedFileTypes,
		children,
		className,
		classNames,
		disableInbuiltValidation,
		existingFiles,
		onChange,
		onUpload,
		onUploadError,
		onUploadSuccess,
		ref = inputRef,
		validationSettings,
		validator,
		...restOfInputProps
	} = props;

	const [isDragging, toggleIsDragging] = useToggle(false);

	const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);

	const handleFileUpload = useCallbackRef(
		(event: ChangeEvent<HTMLInputElement> | DragEvent<HTMLDivElement>) => {
			if (event.type === "drop") {
				event.preventDefault();
				toggleIsDragging(false);
			}

			const fileList =
				event.type === "drop"
					? (event as DragEvent).dataTransfer.files
					: (event as ChangeEvent<HTMLInputElement>).target.files;

			if (fileList === null) {
				console.warn("No file selected");

				return;
			}

			const inbuiltValidatedFilesArray = !disableInbuiltValidation
				? handleFileValidation({
						existingFileArray: existingFiles,
						newFileList: fileList,
						onError: onUploadError,
						onSuccess: onUploadSuccess,
						validationSettings: isObject(validationSettings)
							? { ...validationSettings, allowedFileTypes }
							: {},
					})
				: [];

			const validatorFnFileArray = validator
				? validator({ existingFileArray: existingFiles, newFileList: fileList })
				: [];

			const validFilesArray = [...inbuiltValidatedFilesArray, ...validatorFnFileArray];

			if (validFilesArray.length === 0) return;

			setAcceptedFiles(validFilesArray);

			onUpload?.({ acceptedFiles: validFilesArray, event });
		}
	);

	const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		toggleIsDragging(true);
	};

	const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		toggleIsDragging(false);
	};

	const getRenderProps = () =>
		({
			acceptedFiles,
			inputRef: ref as React.RefObject<HTMLInputElement>,
			isDragging,
		}) satisfies RenderProps;

	const getChildren = () => (isFunction(children) ? children(getRenderProps()) : children);

	const getRootProps = () => ({
		className: cnMerge(
			"relative isolate flex w-full flex-col",
			classNames?.base,
			isDragging && ["opacity-60", classNames?.activeDrag]
		),
		"data-drag-active": isDragging,
		onDragLeave: handleDragLeave,
		onDragOver: handleDragOver,
		onDrop: handleFileUpload,
	});

	const getInputProps = (): Omit<InputProps, "children"> => ({
		accept: allowedFileTypes ? allowedFileTypes.join(", ") : accept,
		className: cnMerge(
			"absolute inset-0 z-[100] cursor-pointer opacity-0",
			className,
			classNames?.input
		),
		onChange: (event: ChangeEvent<HTMLInputElement>) => {
			handleFileUpload(event);
			onChange?.(event);
		},
		ref,
		type: "file",
		...restOfInputProps,
	});

	return {
		getChildren,
		getInputProps,
		getRenderProps,
		getRootProps,
		handleDragLeave,
		handleDragOver,
		handleFileUpload,
		isDragging,
		ref,
	};
};

export { useDropZone };
