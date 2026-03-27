import { InitiativeUploadData } from "@rhtp/shared";

export type UploadFileData = {
  uploadedFileName: string;
  uploadedFileType: string;
  uploadedFileSize: number;
  uploadId: string;
  initiative?: InitiativeUploadData;
};

export interface UploadData {
  uploadedState: string;
  awsFilename: string;
  filename: string;
  uploadedDate: string;
  uploadedUsername: string;
  fileId: string;
  filesize: number;
  initiative?: InitiativeUploadData;
}
