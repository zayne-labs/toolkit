import type { FileValidationErrorContext, FileValidationOptions, FileValidationResult } from "./types";
import { formatBytes, isDuplicateFile, isMaxFileCountReached, isValidFileType, toBytes } from "./utils";

/**
 * @description Core validation logic shared between sync and async validation
 *
 * @internal
 */
const executeValidation = async (options: FileValidationOptions<"async"> & FileValidationResult) => {
	const { errors, existingFiles = [], hooks, newFiles = [], settings, validFiles } = options;

	const { allowedFileTypes, maxFileCount, maxFileSize, rejectDuplicateFiles, validator } = settings ?? {};

	const maxFileSizeInBytes = toBytes(maxFileSize);

	const { onError, onErrorCollection, onSuccess } = hooks ?? {};

	//	== Loop through the uploaded fileList and validate each file

	/* eslint-disable no-await-in-loop -- Required for async validation */
	for (const file of newFiles) {
		if (!file) continue;

		if (maxFileCount && isMaxFileCountReached(maxFileCount, existingFiles, validFiles)) {
			const context = {
				cause: "maxFileCount",
				code: "too-many-files",
				file,
				message: `You can only upload a maximum of ${maxFileCount} files`,
			} satisfies FileValidationErrorContext;

			errors.push(context);

			await onError?.(context);

			break;
		}

		if (allowedFileTypes && !isValidFileType(file, allowedFileTypes)) {
			const acceptedFilesString = allowedFileTypes.join(" | ");

			const context = {
				cause: "allowedFileTypes",
				code: "invalid-file-type",
				file,
				message: `File "${file.name}" is not an accepted file type. File must be of type: ${acceptedFilesString}`,
			} satisfies FileValidationErrorContext;

			errors.push(context);

			await onError?.(context);

			continue;
		}

		if (maxFileSizeInBytes && file.size > maxFileSizeInBytes) {
			const context = {
				cause: "maxFileSize",
				code: "file-too-large",
				file,
				message: `File "${file.name}" exceeds the maximum size of ${formatBytes(maxFileSizeInBytes)}`,
			} satisfies FileValidationErrorContext;

			errors.push(context);

			await onError?.(context);

			continue;
		}

		if (rejectDuplicateFiles && isDuplicateFile(file, existingFiles)) {
			const context = {
				cause: "rejectDuplicateFiles",
				code: "duplicate-file",
				file,
				message: `File: "${file.name}" has already been uploaded`,
			} satisfies FileValidationErrorContext;

			errors.push(context);

			await onError?.(context);

			continue;
		}

		const validatorResult = await validator?.({ file });

		if (validatorResult) {
			const context = {
				cause: "validator",
				code: validatorResult.code ?? "custom-validation-failed",
				file,
				message: validatorResult.message ?? `File "${file.name}" failed custom validation`,
			} satisfies FileValidationErrorContext;

			errors.push(context);

			await onError?.(context);

			continue;
		}

		validFiles.push(file);
	}
	/* eslint-enable no-await-in-loop -- Required for async validation */

	// Handle final callbacks
	if (errors.length > 0) {
		await onErrorCollection?.({ errors });
	}

	if (validFiles.length > 0) {
		const message = `Uploaded ${validFiles.length} file${validFiles.length > 1 ? "s" : ""}!`;

		await onSuccess?.({ message, validFiles });
	}
};

export { executeValidation };
