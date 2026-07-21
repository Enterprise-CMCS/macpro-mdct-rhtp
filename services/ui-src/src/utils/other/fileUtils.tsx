import {
  Image,
  Button,
  List,
  ListItem,
  Text,
  VStack,
  Progress,
  HStack,
} from "@chakra-ui/react";
import {
  deleteUploadedFile,
  getFileDownloadUrl,
  getZipPresignedUrl,
} from "../api/requestMethods/fileMethods";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import successIcon from "assets/icons/status/icon_status_check.svg";
import DOMPurify from "dompurify";
import { bytesToKiloBytes, parseHtml } from "./parsing";
import {
  ReportType,
  UploadListProp,
  AttachmentStatus,
  ZipRequestBody,
} from "@rhtp/shared";

export const acceptedFileTypes = [
  ".bmp",
  ".txt",
  ".csv",
  ".jar",
  ".odt",
  ".ods",
  ".odp",
  ".msg",
  ".potx",
  ".pptx",
  ".ppt",
  ".rtf",
  ".tif",
  ".gif",
  ".jpeg",
  ".png",
  ".docm",
  ".docx",
  ".doc",
  ".pdf",
  ".jpg",
  ".xlsx",
  ".xltx",
  ".xls",
  ".xml",
];

const negatedAllowedCharacters = /[^0-9a-zA-Z._-]+/g;

export const getFileWithSafeName = (file: File) => {
  const newName = file.name.replaceAll(negatedAllowedCharacters, "");
  return new File([file], newName, {
    type: file.type,
    lastModified: file.lastModified,
  });
};

export const downloadFile = async (
  reportType: ReportType,
  state: string,
  id: string,
  file: UploadListProp
) => {
  const fileLink = await getFileDownloadUrl(reportType, state, id, file.fileId);
  const sanitizeLink = DOMPurify.sanitize(fileLink);
  window.open(sanitizeLink);
};

export const getZipFile = async (body: ZipRequestBody) => {
  const fileLink = await getZipPresignedUrl(body);
  const sanitizeLink = DOMPurify.sanitize(fileLink);

  const link = document.createElement("a");
  link.href = sanitizeLink;
  link.click();
};

export const canEditAttachment = (status: AttachmentStatus): boolean => {
  return status !== AttachmentStatus.LOCKED_FOR_SCORING;
};

export const canDeleteAttachment = (
  status: AttachmentStatus,
  canDelete: boolean
): boolean => {
  if (status === AttachmentStatus.PENDING_REVIEW && canDelete) return true;

  return false;
};

export const removeFile = async (
  reportType: ReportType,
  state: string,
  id: string,
  file: File | UploadListProp
) => {
  if (!("fileId" in file)) return;
  return deleteUploadedFile(reportType, state, id, file.fileId);
};

export const uploadListRender = (
  reportType: ReportType,
  state: string,
  id: string,
  files:
    | File[]
    | UploadListProp[]
    | { name: string; size: number; fileId: string; message?: string }[],
  onRemove: Function,
  onClick?: Function,
  removeIconHidden: boolean = false,
  disabled?: boolean
) => {
  return (
    <List variant="upload" mb="spacer3">
      {files?.map((file, fileIdx) => (
        <ListItem key={`${file.name}.${fileIdx}`}>
          <VStack width="100%">
            <HStack width="100%" justifyContent="space-between">
              <VStack alignItems="flex-start">
                {!onClick ? (
                  <Text>{file.name}</Text>
                ) : (
                  <Button
                    variant="link"
                    onClick={() => onClick(reportType, state, id, file)}
                    textAlign="left"
                  >
                    {file.name}
                  </Button>
                )}
                <span>{bytesToKiloBytes(file.size)} KB</span>
                {"message" in file && file.message && (
                  <span className="successMsg">
                    <Image src={successIcon} />
                    Uploaded to: {parseHtml(file.message)}
                  </span>
                )}
              </VStack>
              <Button
                variant="unstyled"
                aria-label={`delete ${file.name}`}
                onClick={() => onRemove(file)}
                rightIcon={<Image src={cancelIcon} alt="Remove Icon" />}
                hidden={removeIconHidden}
                disabled={disabled}
              />
            </HStack>
            {!onClick && (
              <Progress className="progress" size="lg" isIndeterminate />
            )}
          </VStack>
        </ListItem>
      ))}
    </List>
  );
};
