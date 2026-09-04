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
} from "../../api/requestMethods/datasetUploads";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import cancelIconGray from "assets/icons/cancel/icon_cancel_gray.svg";
import successIcon from "assets/icons/status/icon_status_check.svg";
import DOMPurify from "dompurify";
import { bytesToKiloBytes, parseHtml } from "./parsing";
import { UploadListProp } from "@rhtp/shared";

const negatedAllowedCharacters = /[^0-9a-zA-Z._-]+/g;

export const getFileWithSafeName = (file: File) => {
  const newName = file.name.replaceAll(negatedAllowedCharacters, "");
  return new File([file], newName, {
    type: file.type,
    lastModified: file.lastModified,
  });
};

export const downloadFile = async (
  datasetId: string,
  state: string,
  fileId: string
) => {
  const fileLink = await getFileDownloadUrl(datasetId, state, fileId);
  console.log("fileLink", fileLink);
  const sanitizeLink = DOMPurify.sanitize(fileLink);
  window.open(sanitizeLink);
};

export const removeFile = async (state: string, id: string, fileId: string) => {
  return deleteUploadedFile(state, id, fileId);
};

export const uploadListRender = (
  state: string,
  id: string,
  files: File[] | UploadListProp[] | (UploadListProp & { message?: string })[],
  onRemove?: Function,
  onClick?: Function,
  disabled?: boolean
) => {
  return (
    <List variant="upload" mb="spacer3">
      {files?.map((file, fileIdx) => (
        <ListItem key={`${file.name}.${fileIdx}`}>
          <VStack width="100%">
            <HStack width="100%" justifyContent="space-between">
              <VStack alignItems="flex-start">
                {"label" in file && <Text fontWeight="bold">{file.label}</Text>}
                {!onClick ? (
                  <Text>{file.name}</Text>
                ) : (
                  <Button
                    variant="link"
                    onClick={() => onClick(state, id, file)}
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
              {onRemove && (
                <Button
                  variant="unstyled"
                  aria-label={`delete ${file.name}`}
                  onClick={() => onRemove(file)}
                  rightIcon={
                    <Image
                      src={disabled ? cancelIconGray : cancelIcon}
                      alt="Remove"
                    />
                  }
                  disabled={disabled}
                />
              )}
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
