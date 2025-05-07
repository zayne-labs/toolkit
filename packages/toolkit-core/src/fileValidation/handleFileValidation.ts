import type { UnmaskType } from "@zayne-labs/toolkit-type-helpers";
import { isDuplicateFile, isMaxFileCountReached, isValidFileType, megaByteToByte } from "./utils";

export type FileMeta = {
	id: string;
	name: string;
	size: number | undefined;
	type: string;
	url: string;
};

export type ValidationSettings = {
	/**
	 * Array of allowed file types
	 */
	allowedFileTypes?: string[];
	/**
	 * Prevent duplicate files from being uploaded
	 */
	disallowDuplicates?: boolean;
	/**
	 * Maximum number of files that can be uploaded.
	 */
	maxFileCount?: number;
	/**
	 * Maximum file size in MB
	 */
	maxFileSize?: number;

	/**
	 * Custom validation function
	 * If the function returns false, the file will be rejected
	 */
	validator?: (context: { file: File }) => boolean;
};

type PossibleErrorCodes = UnmaskType<
	| "custom-validation-failed" // Custom validation failed
	| "duplicate-file" // File already exists when disallowDuplicates=true
	| "file-invalid-type" // File type not in allowedFileTypes
	| "file-too-large" // File exceeds maxFileSize
	| "too-many-files" // Files exceed maxFileCount
>;

export type FileValidationErrorContext = {
	/**
	 * Name of the validation setting that caused the error
	 */
	cause: keyof ValidationSettings;
	/**
	 * Code that describes the type of error that occurred
	 */
	code: PossibleErrorCodes;
	/**
	 * File that caused the validation error
	 */
	file: File;
	/**
	 * Error message
	 */
	message: string;
};

export type FileValidationSuccessContext = {
	/**
	 * Success message
	 */
	message: string;
	/**
	 * Array of successfully validated files
	 */
	validFiles: File[];
};

export type FileValidationOptions = {
	/**
	 * Array of existing files
	 */
	existingFiles?: Array<File | FileMeta>;
	/**
	 * FileList uploaded by user
	 */
	newFiles: File[] | FileList;
	/**
	 * Callback function to be called on each file upload as they occur
	 */
	onError?: (context: FileValidationErrorContext) => void;
	/**
	 * Callback function to be called once after all file upload errors have occurred
	 */
	onErrors?: (contextArray: FileValidationErrorContext[]) => void;
	/**
	 * Callback function to be called on validation success
	 */
	onSuccess?: (context: FileValidationSuccessContext) => void;
	/**
	 * Validation settings
	 */
	validationSettings?: ValidationSettings;

	/**
	 * Custom validation function that runs after all file validation has occurred
	 */
	validatorForAllFiles?: (
		context: Pick<FileValidationOptions, "existingFiles" | "newFiles" | "onError"> & ValidationResult
	) => File[];
};

type ValidationResult = {
	errors: FileValidationErrorContext[];
	validFiles: File[];
};

const handleFileValidation = (options: FileValidationOptions): ValidationResult => {
	const {
		existingFiles = [],
		newFiles,
		onError,
		onErrors,
		onSuccess,
		validationSettings = {},
		validatorForAllFiles,
	} = options;

	const { allowedFileTypes, disallowDuplicates, maxFileCount, maxFileSize, validator } =
		validationSettings;

	const validFiles: File[] = [];

	const errors: FileValidationErrorContext[] = [];

	//	== Loop through the uploaded fileList and validate each file
	for (const file of newFiles) {
		if (maxFileCount && isMaxFileCountReached(maxFileCount, existingFiles, validFiles)) {
			const message = `You can only upload a maximum of ${maxFileCount} files`;

			const context: FileValidationErrorContext = {
				cause: "maxFileCount",
				code: "too-many-files",
				file,
				message,
			};

			errors.push(context);

			onError?.(context);

			break;
		}

		if (allowedFileTypes && !isValidFileType(file, allowedFileTypes)) {
			const acceptedFilesString = allowedFileTypes.join(" | ");

			const message = `File "${file.name}" is not an accepted file type. File must be of type: ${acceptedFilesString}`;

			const context: FileValidationErrorContext = {
				cause: "allowedFileTypes",
				code: "file-invalid-type",
				file,
				message,
			};

			errors.push(context);

			onError?.(context);

			continue;
		}

		if (maxFileSize && file.size > megaByteToByte(maxFileSize)) {
			const message = `File "${file.name}" exceeds the maximum size of ${maxFileSize}mb`;

			const context: FileValidationErrorContext = {
				cause: "maxFileSize",
				code: "file-too-large",
				file,
				message,
			};

			errors.push(context);

			onError?.(context);

			continue;
		}

		if (disallowDuplicates && isDuplicateFile(file, existingFiles)) {
			const message = `File: "${file.name}" has already been selected`;

			const context: FileValidationErrorContext = {
				cause: "disallowDuplicates",
				code: "duplicate-file",
				file,
				message,
			};

			errors.push(context);

			onError?.(context);

			continue;
		}

		if (validator && !validator({ file })) {
			const message = `File "${file.name}" failed custom validation`;

			const context: FileValidationErrorContext = {
				cause: "validator",
				code: "custom-validation-failed",
				file,
				message,
			};

			errors.push(context);

			onError?.(context);

			continue;
		}

		validFiles.push(file);
	}

	const validationForAllFilesResult = validatorForAllFiles?.({
		errors,
		existingFiles,
		newFiles,
		onError,
		validFiles,
	});

	if (errors.length > 0) {
		onErrors?.(errors);
	}

	const resolvedValidFiles = validationForAllFilesResult ?? validFiles;

	if (resolvedValidFiles.length > 0) {
		const message = `Uploaded ${resolvedValidFiles.length} file${resolvedValidFiles.length > 1 ? "s" : ""}!`;

		onSuccess?.({ message, validFiles: resolvedValidFiles });
	}

	return { errors, validFiles: resolvedValidFiles };
};

export { handleFileValidation };
