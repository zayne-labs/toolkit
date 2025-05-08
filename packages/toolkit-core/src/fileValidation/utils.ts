import { isFile, isNumber } from "@zayne-labs/toolkit-type-helpers";
import type { FileValidationOptions } from "./handleFileValidation";

export const isValidFileType = (
	file: File,
	allowedFileTypes: Required<Required<FileValidationOptions>["validationSettings"]>["allowedFileTypes"]
) => {
	return allowedFileTypes.some((type) => {
		// == Check if it's a MIME type (contains '/')
		if (type.includes("/")) {
			return file.type === type;
		}

		const fileExtension = file.name.includes(".") ? file.name.split(".").at(-1)?.toLowerCase() : null;

		if (!fileExtension) {
			return false;
		}

		const typeWithoutDot = type.startsWith(".") ? type.toLowerCase().slice(1) : type.toLowerCase();

		return fileExtension === typeWithoutDot;
	});
};

export const isDuplicateFile = (
	file: File,
	existingFiles: NonNullable<FileValidationOptions["existingFiles"]>
) => {
	return existingFiles.some((existingFile) => {
		if (isFile(existingFile)) {
			return existingFile.name === file.name && existingFile.size === file.size;
		}

		if (isNumber(existingFile.size)) {
			return existingFile.name === file.name && existingFile.size === file.size;
		}

		return existingFile.name === file.name;
	});
};

export const isMaxFileCountReached = (
	maxFileCount: number,
	existingFiles: Required<FileValidationOptions>["existingFiles"],
	validFiles: Required<FileValidationOptions>["newFiles"]
) => {
	return existingFiles.length === maxFileCount || validFiles.length === maxFileCount;
};

export const megaByteToByte = (size: number) => size * 1024 * 1024;
