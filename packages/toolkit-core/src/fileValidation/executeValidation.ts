import { isNumber, isString } from "@zayne-labs/toolkit-type-helpers";
import type {
	BuiltInFileValidationErrorCode,
	FileOrFileMeta,
	FileValidationErrorContextBatch,
	FileValidationErrorContextEach,
	FileValidationOptions,
	FileValidationResult,
	FileValidationSettings,
	FileValidationSuccessContextBatch,
	FileValidationSuccessContextEach,
} from "./types";
import { formatBytes, isDuplicateFile, isMaxFileCountReached, isValidFileType, toBytes } from "./utils";

type ValidatorResult = ReturnType<NonNullable<FileValidationSettings["validator"]>>;

type ValidationGenerator = Generator<unknown, void, unknown>;

type ErrorCause = Extract<FileValidationErrorContextEach, { cause: unknown }>["cause"];

/**
 * @description Core validation logic shared between sync and async validation.
 *
 * Every hook/validator call is `yield`ed instead of `await`ed, so the caller decides
 * whether to resolve each step synchronously ({@link runSync}) or asynchronously ({@link runAsync}).
 *
 * @internal
 */
function* validationSteps(
	options: FileValidationOptions<"async"> & FileValidationResult
): ValidationGenerator {
	const { errors, existingFiles = [], hooks, newFiles = [], settings, validFiles } = options;

	const {
		allowedFileTypes,
		maxFileCount,
		maxFileSize,
		messages,
		minFileSize,
		rejectDuplicateFiles,
		validator,
	} = settings ?? {};

	const maxFileSizeInBytes = toBytes(maxFileSize);
	const minFileSizeInBytes = toBytes(minFileSize);

	const createError = (
		file: FileOrFileMeta,
		details: { cause: ErrorCause; code: string; defaultMessage: string; explicitMessage?: string | null }
	): FileValidationErrorContextEach => {
		const message = resolveMessage(file, details);

		return { cause: details.cause, code: details.code, file, message } as FileValidationErrorContextEach;
	};

	/**
	 * @description Resolves an error message with priority: explicit message (e.g. returned by the validator) > `settings.messages` override > default message
	 */
	const resolveMessage = (
		file: FileOrFileMeta,
		details: { code: string; defaultMessage: string; explicitMessage?: string | null }
	) => {
		if (details.explicitMessage) return details.explicitMessage;

		const messageOverride = messages?.[details.code as BuiltInFileValidationErrorCode];

		if (!messageOverride) return details.defaultMessage;

		if (isString(messageOverride)) return messageOverride;

		return messageOverride({ defaultMessage: details.defaultMessage, file });
	};

	//	== Loop through the uploaded fileList and validate each file
	for (const file of newFiles) {
		if (!file) continue;

		if (maxFileCount && isMaxFileCountReached(maxFileCount, existingFiles, validFiles)) {
			const errorContext = createError(file, {
				cause: "maxFileCount",
				code: "too-many-files",
				defaultMessage: `You can only upload up to ${maxFileCount} files. File "${file.name}" has been rejected`,
			});

			errors.push(errorContext);

			yield hooks?.onErrorEach?.(errorContext);

			break;
		}

		if (allowedFileTypes && !isValidFileType(file, allowedFileTypes)) {
			const errorContext = createError(file, {
				cause: "allowedFileTypes",
				code: "invalid-file-type",
				defaultMessage: `File "${file.name}" is not an accepted file type. File must be of type: ${allowedFileTypes.join(" | ")}`,
			});

			errors.push(errorContext);

			yield hooks?.onErrorEach?.(errorContext);

			continue;
		}

		if (maxFileSizeInBytes && isNumber(file.size) && file.size > maxFileSizeInBytes) {
			const errorContext = createError(file, {
				cause: "maxFileSize",
				code: "file-too-large",
				defaultMessage: `File "${file.name}" exceeds the maximum size of ${formatBytes(maxFileSizeInBytes)}`,
			});

			errors.push(errorContext);

			yield hooks?.onErrorEach?.(errorContext);

			continue;
		}

		if (minFileSizeInBytes && isNumber(file.size) && file.size < minFileSizeInBytes) {
			const errorContext = createError(file, {
				cause: "minFileSize",
				code: "file-too-small",
				defaultMessage: `File "${file.name}" is below the minimum size of ${formatBytes(minFileSizeInBytes)}`,
			});

			errors.push(errorContext);

			yield hooks?.onErrorEach?.(errorContext);

			continue;
		}

		if (rejectDuplicateFiles && isDuplicateFile(file, [...existingFiles, ...validFiles])) {
			const errorContext = createError(file, {
				cause: "rejectDuplicateFiles",
				code: "duplicate-file",
				defaultMessage: `File "${file.name}" has already been uploaded`,
			});

			errors.push(errorContext);

			yield hooks?.onErrorEach?.(errorContext);

			continue;
		}

		const validatorResult = (yield validator?.({ file })) as ValidatorResult;

		if (validatorResult) {
			const errorContext = createError(file, {
				cause: "validator",
				code: validatorResult.code ?? "custom-validation-failed",
				defaultMessage: `File "${file.name}" failed custom validation`,
				explicitMessage: validatorResult.message,
			});

			errors.push(errorContext);

			yield hooks?.onErrorEach?.(errorContext);

			continue;
		}

		const successContext = {
			message: `Processed file-(${file.name}) successfully!`,
			validFile: file,
		} satisfies FileValidationSuccessContextEach;

		validFiles.push(file);

		yield hooks?.onSuccessEach?.(successContext);
	}

	if (errors.length > 0) {
		const context = { errors } satisfies FileValidationErrorContextBatch;

		yield hooks?.onErrorBatch?.(context);
	}

	if (validFiles.length > 0) {
		const context = {
			message: `Processed ${validFiles.length} ${validFiles.length === 1 ? "file" : "files"} successfully!`,
			validFiles,
		} satisfies FileValidationSuccessContextBatch;

		yield hooks?.onSuccessBatch?.(context);
	}
}

/**
 * @description Drives the validation generator synchronously, feeding each yielded value straight back in
 *
 * @internal
 */
const runSync = (generator: ValidationGenerator) => {
	let step = generator.next();

	while (!step.done) {
		step = generator.next(step.value);
	}
};

/**
 * @description Drives the validation generator asynchronously, awaiting each yielded value before resuming
 *
 * @internal
 */
const runAsync = async (generator: ValidationGenerator) => {
	let step = generator.next();

	while (!step.done) {
		// eslint-disable-next-line no-await-in-loop -- Steps must run sequentially
		step = generator.next(await step.value);
	}
};

export { runAsync, runSync, validationSteps };
