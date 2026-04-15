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
} from "../api/requestMethods/upload";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import DOMPurify from "dompurify";
import { bytesToKiloBytes } from "./parsing";
import { UploadListProp } from "types";

export const acceptedFileTypes = [
  ".ppt",
  ".pdf",
  ".doc",
  ".docx",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
];

export const downloadFile = async (
  year: string,
  state: string,
  file: UploadListProp
) => {
  const fileLink = await getFileDownloadUrl(year, state, file.fileId);
  const sanitizeLink = DOMPurify.sanitize(fileLink);
  window.open(sanitizeLink);
};

export const removeFile = async (
  file: File | UploadListProp,
  year: string,
  state: string
) => {
  if (!("fileId" in file)) return;
  return deleteUploadedFile(year, state, file.fileId);
};

export const uploadListRender = (
  files: File[] | UploadListProp[],
  year: string,
  state: string,
  onRemove: Function,
  onClick?: Function
) => {
  return (
    <List variant="upload">
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
                    onClick={() => onClick(year, state, file)}
                  >
                    {file.name}
                  </Button>
                )}
                <span>{bytesToKiloBytes(file.size)} KB</span>
              </VStack>
              <Button
                variant="unstyled"
                aria-label={`delete ${file.name}`}
                onClick={() => onRemove(file)}
                rightIcon={<Image src={cancelIcon} alt="Remove Icon" />}
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
