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
  getFileDownloadUrl,
  getUploadedFiles,
} from "../api/requestMethods/upload";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import DOMPurify from "dompurify";

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

export type UploadListProp = {
  name: string;
  size: number;
  fileId: string;
};

export const retrieveUploadedFiles = async (
  year: string,
  state: string,
  uploadId: string
) => {
  const uploadedFiles = await getUploadedFiles(year, state!, uploadId);
  return uploadedFiles.map((file) => {
    return { name: file.filename, size: file.filesize, fileId: file.fileId };
  });
};

export const downloadFile = async (
  year: string,
  state: string,
  file: UploadListProp
) => {
  const fileLink = await getFileDownloadUrl(year, state!, file.fileId);
  const sanitizeLink = DOMPurify.sanitize(fileLink);
  window.open(sanitizeLink);
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
                  <Text>{file?.name}</Text>
                ) : (
                  <Button
                    variant="link"
                    onClick={() => onClick(year, state, file)}
                  >
                    {file?.name}
                  </Button>
                )}
                <span>{file.size} KB</span>
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
