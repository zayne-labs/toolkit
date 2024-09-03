import { toast } from "sonner";

type ValidationRules = {
	allowedFileTypes?: string[];
	disallowDuplicates?: boolean;
	fileLimit?: number;
	maxFileSize?: number;
};

const handleFileValidation = (
	newFileList: FileList,
	existingFileArray?: File[],
	validationRules?: ValidationRules
) => {
	const { allowedFileTypes, disallowDuplicates, fileLimit, maxFileSize } = validationRules ?? {};

	const validFilesArray: File[] = [];

	const isFileUnique = (file: File) => {
		return (existingFileArray ?? []).every((fileItem) => fileItem.name !== file.name);
	};

	const isFileLimitReached = (limit: number) => {
		return (existingFileArray ?? []).length === limit || validFilesArray.length === limit;
	};

	// eslint-disable-next-line unicorn/consistent-function-scoping
	const fileSizeToMb = (size: number) => size * 1024 * 1024;

	//	== Loop through fileList and validate each file
	for (const file of newFileList) {
		if (fileLimit && isFileLimitReached(fileLimit)) {
			toast.error("Error", {
				description: `Cannot upload more than ${fileLimit} files`,
			});

			break;
		}

		if (allowedFileTypes && !allowedFileTypes.includes(file.type)) {
			const acceptedFilesString = allowedFileTypes.join(" | ");

			toast.error("Error", {
				description: `File type must be of: ${acceptedFilesString}`,
			});

			continue;
		}

		if (maxFileSize && file.size > fileSizeToMb(maxFileSize)) {
			toast.error("Error", {
				description: `Cannot upload a file larger than ${maxFileSize}mb`,
			});

			continue;
		}

		if (disallowDuplicates && !isFileUnique(file)) {
			toast.error("Error", {
				description: `File: "${file.name}" has already been selected`,
			});

			continue;
		}

		validFilesArray.push(file);
	}

	return validFilesArray;
};

export { handleFileValidation };
