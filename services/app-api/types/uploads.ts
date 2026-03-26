export type InitiativeUploadData = {
  id: string[];
  status: string;
  stage: string;
  checkpoints: [];
};

export type UploadFileData = {
  uploadedFileName: string;
  uploadedFileType: string;
  uploadedFileSize: number;
  uploadId: string;
  initiatives?: InitiativeUploadData;
};

export interface UploadData {
  uploadedState: string;
  awsFilename: string;
  filename: string;
  uploadedDate: string;
  uploadedUsername: string;
  fileId: string;
  filesize: number;
  initiatives?: InitiativeUploadData;
}
