import { fileTypeFromBuffer } from "file-type";
import { isAllowedFileExtension } from "@rhtp/shared";

const ZIP_CONTAINER = "application/zip";
const CFB = "application/x-cfb";

export const EXTENSIONS_WITHOUT_MAGIC_BYTES = [
  ".txt",
  ".csv",
  ".rtf",
  ".msg",
] as const;

export const EXTENSION_MIME_MAP: Record<string, string[]> = {
  ".bmp": ["image/bmp"],
  ".gif": ["image/gif"],
  ".jpeg": ["image/jpeg"],
  ".jpg": ["image/jpeg"],
  ".png": ["image/png"],
  ".tif": ["image/tiff"],
  ".pdf": ["application/pdf"],
  ".doc": [CFB, "application/msword"],
  ".docx": [
    ZIP_CONTAINER,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ".docm": [
    ZIP_CONTAINER,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ".xls": [CFB, "application/vnd.ms-excel"],
  ".xlsx": [
    ZIP_CONTAINER,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ".xltx": [
    ZIP_CONTAINER,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ".ppt": [CFB, "application/vnd.ms-powerpoint"],
  ".pptx": [
    ZIP_CONTAINER,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  ".potx": [
    ZIP_CONTAINER,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  ".odt": [ZIP_CONTAINER, "application/vnd.oasis.opendocument.text"],
  ".ods": [ZIP_CONTAINER, "application/vnd.oasis.opendocument.spreadsheet"],
  ".odp": [ZIP_CONTAINER, "application/vnd.oasis.opendocument.presentation"],
  ".jar": [ZIP_CONTAINER, "application/java-archive"],
  ".msg": ["application/vnd.ms-outlook"],
  ".rtf": ["application/rtf"],
};

const MARKUP_PREFIXES = ["<svg", "<?xml", "<!doctype html", "<html"] as const;

const hasBlockedMarkupOrScriptPrefix = (buffer: Uint8Array): boolean => {
  if (buffer.length === 0) {
    return false;
  }

  const preview = new TextDecoder("utf-8", { fatal: false })
    .decode(buffer.slice(0, 256))
    .trimStart()
    .toLowerCase();

  if (MARKUP_PREFIXES.some((prefix) => preview.startsWith(prefix))) {
    return true;
  }

  return preview.startsWith("#!");
};

export const validateFileContentMatchesExtension = async (
  buffer: Uint8Array,
  extension: string
): Promise<boolean> => {
  // this is the filename extension as parsed from the s3 object key
  const ext = extension.toLowerCase();
  // It should have never been allowed to have been uploaded in the first place, but if there's a non-allowed extension, return early)
  if (!isAllowedFileExtension(ext)) {
    return false;
  }

  // Just because the file was uploaded as a .png does not mean it's file content is a png, so we check the actual magic bytes
  const detected = await fileTypeFromBuffer(buffer);

  const isTextLikeExtension = EXTENSIONS_WITHOUT_MAGIC_BYTES.includes(
    ext as (typeof EXTENSIONS_WITHOUT_MAGIC_BYTES)[number]
  );

  if (isTextLikeExtension) {
    if (!detected) {
      // for text-like extensions, make sure they aren't smuggling in some markup file that doesn't have magic bytes
      return !hasBlockedMarkupOrScriptPrefix(buffer);
    }
    // it it is text like and WAS detected, someone is likely misbehaving and smuggling a malicious file, but we'll give them the benefit of the doubt and check if for example an allowed filetype was just misnamed ie. legit.pdf -> legit.pdf.txt
    const allowedMimes = EXTENSION_MIME_MAP[ext];
    return !!allowedMimes && allowedMimes.includes(detected.mime);
  }

  if (!detected) {
    return false;
  }

  const allowedMimes = EXTENSION_MIME_MAP[ext];
  if (!allowedMimes) {
    return false;
  }
  // here we won't give them the benefit of the doubt and reject MIME type files that don't match their extensions
  return allowedMimes.includes(detected.mime);
};
