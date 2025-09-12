import { isNumber } from "@zayne-labs/toolkit-type-helpers";
import type {
	FileValidationErrorContextBatch,
	FileValidationErrorContextEach,
	FileValidationOptions,
	FileValidationResult,
	FileValidationSuccessContextBatch,
	FileValidationSuccessContextEach,
} from "./types";
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

	//	== Loop through the uploaded fileList and validate each file

	/* eslint-disable no-await-in-loop -- Required for async validation */
	for (const file of newFiles) {
		if (!file) continue;

		if (maxFileCount && isMaxFileCountReached(maxFileCount, existingFiles, validFiles)) {
			const context = {
				cause: "maxFileCount",
				code: "too-many-files",
				file,
				message: `You can only upload a up to ${maxFileCount} files. File "${file.name}" has been rejected`,
			} satisfies FileValidationErrorContextEach;

			errors.push(context);

			await hooks?.onErrorEach?.(context);

			break;
		}

		if (allowedFileTypes && !isValidFileType(file, allowedFileTypes)) {
			const acceptedFilesString = allowedFileTypes.join(" | ");

			const context = {
				cause: "allowedFileTypes",
				code: "invalid-file-type",
				file,
				message: `File "${file.name}" is not an accepted file type. File must be of type: ${acceptedFilesString}`,
			} satisfies FileValidationErrorContextEach;

			errors.push(context);

			await hooks?.onErrorEach?.(context);

			continue;
		}

		if (maxFileSizeInBytes && isNumber(file.size) && file.size > maxFileSizeInBytes) {
			const context = {
				cause: "maxFileSize",
				code: "file-too-large",
				file,
				message: `File "${file.name}" exceeds the maximum size of ${formatBytes(maxFileSizeInBytes)}`,
			} satisfies FileValidationErrorContextEach;

			errors.push(context);

			await hooks?.onErrorEach?.(context);

			continue;
		}

		if (rejectDuplicateFiles && isDuplicateFile(file, existingFiles)) {
			const context = {
				cause: "rejectDuplicateFiles",
				code: "duplicate-file",
				file,
				message: `File "${file.name}" has already been uploaded`,
			} satisfies FileValidationErrorContextEach;

			errors.push(context);

			await hooks?.onErrorEach?.(context);

			continue;
		}

		const validatorResult = await validator?.({ file });

		if (validatorResult) {
			const context = {
				cause: "validator",
				code: validatorResult.code ?? "custom-validation-failed",
				file,
				message: validatorResult.message ?? `File "${file.name}" failed custom validation`,
			} satisfies FileValidationErrorContextEach;

			errors.push(context);

			await hooks?.onErrorEach?.(context);

			continue;
		}

		const context = {
			message: `Processed file-(${file.name}) successfully!`,
			validFile: file,
		} satisfies FileValidationSuccessContextEach;

		validFiles.push(file);

		await hooks?.onSuccessEach?.(context);
	}
	/* eslint-enable no-await-in-loop -- Required for async validation */

	if (errors.length > 0) {
		const context = { errors } satisfies FileValidationErrorContextBatch;

		await hooks?.onErrorBatch?.(context);
	}

	if (validFiles.length > 0) {
		const context = {
			message: `Processed ${validFiles.length} ${validFiles.length === 1 ? "file" : "files"} successfully!`,
			validFiles,
		} satisfies FileValidationSuccessContextBatch;

		await hooks?.onSuccessBatch?.(context);
	}
};

export { executeValidation };
