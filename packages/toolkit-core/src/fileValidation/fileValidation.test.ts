import { describe, expect, test, vi } from "vitest";
import { handleFileValidation, handleFileValidationAsync } from "./handleFileValidation";

const createFile = (
	name: string,
	options: { lastModified?: number; size?: number; type?: string } = {}
) => {
	const { lastModified = 1, size = 10, type = "text/plain" } = options;

	return new File(["x".repeat(size)], name, { lastModified, type });
};

describe("handleFileValidation (sync)", () => {
	test("returns complete results synchronously with hooks and a validator", () => {
		const onErrorEach = vi.fn();
		const onSuccessEach = vi.fn();

		const result = handleFileValidation({
			hooks: { onErrorEach, onSuccessEach },
			newFiles: [createFile("ok.txt"), createFile("bad.txt"), createFile("ok2.txt")],
			settings: {
				validator: ({ file }) => (file.name === "bad.txt" ? { message: "nope" } : null),
			},
		});

		expect(result.validFiles.map((file) => file.name)).toEqual(["ok.txt", "ok2.txt"]);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]).toMatchObject({
			cause: "validator",
			code: "custom-validation-failed",
			message: "nope",
		});
		expect(onSuccessEach).toHaveBeenCalledTimes(2);
		expect(onErrorEach).toHaveBeenCalledTimes(1);
	});

	test("calls each-hooks before batch-hooks", () => {
		const calls: string[] = [];

		handleFileValidation({
			hooks: {
				onErrorBatch: () => calls.push("errorBatch"),
				onErrorEach: () => calls.push("errorEach"),
				onSuccessBatch: () => calls.push("successBatch"),
				onSuccessEach: () => calls.push("successEach"),
			},
			newFiles: [createFile("a.txt"), createFile("b.png", { type: "image/png" })],
			settings: { allowedFileTypes: [".txt"] },
		});

		expect(calls).toEqual(["successEach", "errorEach", "errorBatch", "successBatch"]);
	});
});

describe("handleFileValidationAsync", () => {
	test("awaits async validators and hooks", async () => {
		const onSuccessBatch = vi.fn(async () => {});

		const result = await handleFileValidationAsync({
			hooks: { onSuccessBatch },
			newFiles: [createFile("a.txt"), createFile("b.txt")],
			settings: {
				validator: async ({ file }) => {
					await Promise.resolve();

					return file.name === "b.txt" ? { code: "custom", message: "rejected" } : null;
				},
			},
		});

		expect(result.validFiles.map((file) => file.name)).toEqual(["a.txt"]);
		expect(result.errors[0]).toMatchObject({ code: "custom", message: "rejected" });
		expect(onSuccessBatch).toHaveBeenCalledTimes(1);
	});
});

describe("maxFileCount", () => {
	test("counts existing and new files together", () => {
		const result = handleFileValidation({
			existingFiles: [createFile("e1.txt"), createFile("e2.txt")],
			newFiles: [createFile("n1.txt"), createFile("n2.txt"), createFile("n3.txt")],
			settings: { maxFileCount: 3 },
		});

		expect(result.validFiles.map((file) => file.name)).toEqual(["n1.txt"]);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]).toMatchObject({ cause: "maxFileCount", code: "too-many-files" });
	});

	test("rejects when existing files already exceed the max", () => {
		const result = handleFileValidation({
			existingFiles: [createFile("e1.txt"), createFile("e2.txt"), createFile("e3.txt")],
			newFiles: [createFile("n1.txt")],
			settings: { maxFileCount: 2 },
		});

		expect(result.validFiles).toHaveLength(0);
		expect(result.errors[0]?.code).toBe("too-many-files");
	});
});

describe("rejectDuplicateFiles", () => {
	test("rejects duplicates of existing files", () => {
		const result = handleFileValidation({
			existingFiles: [createFile("a.txt")],
			newFiles: [createFile("a.txt")],
			settings: { rejectDuplicateFiles: true },
		});

		expect(result.validFiles).toHaveLength(0);
		expect(result.errors[0]?.code).toBe("duplicate-file");
	});

	test("rejects duplicates within the same batch", () => {
		const result = handleFileValidation({
			newFiles: [createFile("a.txt"), createFile("a.txt")],
			settings: { rejectDuplicateFiles: true },
		});

		expect(result.validFiles).toHaveLength(1);
		expect(result.errors[0]?.code).toBe("duplicate-file");
	});

	test("does not treat same name/size but different lastModified as duplicates", () => {
		const result = handleFileValidation({
			newFiles: [createFile("a.txt", { lastModified: 1 }), createFile("a.txt", { lastModified: 2 })],
			settings: { rejectDuplicateFiles: true },
		});

		expect(result.validFiles).toHaveLength(2);
		expect(result.errors).toHaveLength(0);
	});
});

describe("allowedFileTypes", () => {
	test("supports wildcard MIME types", () => {
		const result = handleFileValidation({
			newFiles: [
				createFile("a.png", { type: "image/png" }),
				createFile("b.jpg", { type: "image/jpeg" }),
				createFile("c.pdf", { type: "application/pdf" }),
			],
			settings: { allowedFileTypes: ["image/*"] },
		});

		expect(result.validFiles.map((file) => file.name)).toEqual(["a.png", "b.jpg"]);
		expect(result.errors[0]?.code).toBe("invalid-file-type");
	});

	test("matches MIME types and extensions case-insensitively", () => {
		const result = handleFileValidation({
			newFiles: [
				createFile("a.PNG", { type: "image/png" }),
				createFile("b.pdf", { type: "application/pdf" }),
			],
			settings: { allowedFileTypes: [".png", "APPLICATION/PDF"] },
		});

		expect(result.validFiles).toHaveLength(2);
	});
});

describe("minFileSize", () => {
	test("rejects files below the minimum size", () => {
		const result = handleFileValidation({
			newFiles: [createFile("small.txt", { size: 5 }), createFile("ok.txt", { size: 2048 })],
			settings: { minFileSize: { kb: 1 } },
		});

		expect(result.validFiles.map((file) => file.name)).toEqual(["ok.txt"]);
		expect(result.errors[0]).toMatchObject({ cause: "minFileSize", code: "file-too-small" });
		expect(result.errors[0]?.message).toContain("1 KB");
	});
});

describe("messages", () => {
	test("overrides built-in messages with a string", () => {
		const result = handleFileValidation({
			newFiles: [createFile("big.txt", { size: 100 })],
			settings: { maxFileSize: 10, messages: { "file-too-large": "Too big!" } },
		});

		expect(result.errors[0]?.message).toBe("Too big!");
	});

	test("overrides built-in messages with a function that receives the file and default message", () => {
		const result = handleFileValidation({
			newFiles: [createFile("a.pdf", { type: "application/pdf" })],
			settings: {
				allowedFileTypes: ["image/*"],
				messages: {
					"invalid-file-type": ({ defaultMessage, file }) => `[${file.name}] ${defaultMessage}`,
				},
			},
		});

		expect(result.errors[0]?.message).toMatch(/^\[a\.pdf\] File "a\.pdf" is not an accepted file type/);
	});

	test("a message returned by the validator wins over overrides", () => {
		const result = handleFileValidation({
			newFiles: [createFile("a.txt"), createFile("b.txt")],
			settings: {
				messages: { "custom-validation-failed": "Override" },
				validator: ({ file }) =>
					file.name === "a.txt" ?
						{ message: "From validator" }
					:	{ code: "custom-validation-failed" },
			},
		});

		expect(result.errors.map((error) => error.message)).toEqual(["From validator", "Override"]);
	});
});
