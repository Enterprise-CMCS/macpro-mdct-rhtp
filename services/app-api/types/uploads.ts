export type UploadFileData = {
  uploadedFileName: string;
  uploadedFileType: string;
  uploadedFileSize: number;
  uploadId: string;
};

export interface UploadData {
  uploadedState: string;
  awsFilename: string;
  filename: string;
  uploadedDate: string;
  uploadedUsername: string;
  fileId: string;
  filesize: number;
}
