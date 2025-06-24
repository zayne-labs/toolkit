import type {
	AnyFunction,
	AnyString,
	Awaitable,
	Prettify,
	UnionDiscriminator,
	UnmaskType,
} from "@zayne-labs/toolkit-type-helpers";

export interface FileValidationOptions<TVariant extends "async" | "sync" = "sync"> {
	/**
	 * Array of existing files to check against for duplicates and maxFileCount
	 */
	existingFiles?: Array<File | FileMeta>;
	/**
	 * Callbacks for handling validation events
	 */
	hooks?: TVariant extends "sync" ? FileValidationHooks : FileValidationHooksAsync;
	/**
	 * Files to validate
	 */
	newFiles: File[] | FileList;
	/**
	 * Settings to configure validation behavior
	 */
	settings?: TVariant extends "sync" ? FileValidationSettings : FileValidationSettingsAsync;
}

export interface FileValidationResult {
	/**
	 * Array of validation errors that occurred
	 */
	errors: FileValidationErrorContext[];
	/**
	 * Array of files that passed validation
	 */
	validFiles: File[];
}

export type FileMeta = {
	id: string;
	name: string;
	size: number | undefined;
	type: string;
	url: string;
};

type PossibleErrorCodes = UnmaskType<
	| "custom-validation-failed" // Custom validation failed
	| "duplicate-file" // File already exists when disallowDuplicates=true
	| "file-too-large" // File exceeds maxFileSize
	| "invalid-file-type" // File type not in allowedFileTypes
	| "too-many-files" // Files exceed maxFileCount
	| AnyString
>;

export interface FileValidationErrorContext {
	/**
	 * Name of the validation setting that caused the error
	 */
	cause: keyof FileValidationSettings;
	/**
	 * Error code identifying the type of validation failure
	 */
	code: PossibleErrorCodes;
	/**
	 * The file that failed validation
	 */
	file: File;
	/**
	 * Human-readable error message
	 */
	message: string;
}

export interface FileValidationSuccessContext {
	/**
	 * Success message to display to user
	 */
	message: string;
	/**
	 * Array of files that passed validation
	 */
	validFiles: File[];
}

export interface FileValidationSettings {
	/**
	 * List of allowed file extensions/types (e.g. ['.jpg', '.png'])
	 */
	allowedFileTypes?: string[];

	/**
	 * Maximum number of files allowed (including existing files)
	 */
	maxFileCount?: number;

	/**
	 * Maximum file size
	 * By default, the value is in megabytes, but you can also use an object with gb, kb, mb, and bytes properties
	 */
	maxFileSize?:
		| number
		| UnionDiscriminator<[{ kb: number }, { mb: number }, { gb: number }, { tb: number }]>;

	/**
	 * Whether to reject files that already exist in existingFiles
	 */
	rejectDuplicateFiles?: boolean;

	/**
	 * Custom validation function that runs after built-in validation
	 * Return an object with code/message to reject the file, or null/undefined to accept
	 */
	validator?: (context: {
		file: File;
	}) =>
		| { code: FileValidationErrorContext["code"]; message?: FileValidationErrorContext["message"] }
		| { code?: FileValidationErrorContext["code"]; message: FileValidationErrorContext["message"] }
		| null
		| undefined;
}

export interface FileValidationHooks {
	/**
	 * Called when an individual file fails validation
	 */
	onError?: (context: FileValidationErrorContext) => void;
	/**
	 * Called after all validation is complete if any files failed
	 */
	onErrorCollection?: (context: Prettify<Pick<FileValidationResult, "errors">>) => void;
	/**
	 * Called after all validation is complete if any files passed
	 */
	onSuccess?: (context: FileValidationSuccessContext) => void;
}

type ToAwaitableFn<TFunction> =
	TFunction extends AnyFunction ? (...params: Parameters<TFunction>) => Awaitable<ReturnType<TFunction>>
	:	TFunction;

export type FileValidationSettingsAsync = {
	[Key in keyof FileValidationSettings]: ToAwaitableFn<FileValidationSettings[Key]>;
};

export type FileValidationHooksAsync = {
	[Key in keyof FileValidationHooks]: ToAwaitableFn<FileValidationHooks[Key]>;
};
