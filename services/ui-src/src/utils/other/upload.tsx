import { Image, Button, List, ListItem, Text, VStack } from "@chakra-ui/react";
import { getUploadedFiles } from "./fileApi";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";

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

export const uploadListRender = (
  files: File[] | UploadListProp[],
  onRemove: Function,
  onClick?: Function
) => {
  return (
    <List variant="upload">
      {files?.map((file, fileIdx) => (
        <ListItem>
          <VStack>
            {!onClick ? (
              <Text>{file?.name}</Text>
            ) : (
              <Button variant="link" onClick={() => onClick(file)}>
                {file?.name}
              </Button>
            )}
            <span>{file.size} KB</span>
          </VStack>
          <Button
            variant="unstyled"
            onClick={() => onRemove(fileIdx, file)}
            rightIcon={<Image src={cancelIcon} alt="Remove Icon" />}
          />
        </ListItem>
      ))}
    </List>
  );
};
