export type UploadFileData = {
  uploadedFileName: string;
  uploadedFileType: string;
  uploadedFileSize: number;
};

export interface UploadData {
  uploadedState: string;
  filename: string;
  uploadedDate: string;
  uploadedUsername: string;
  fileId: string;
  filesize: number;
}
