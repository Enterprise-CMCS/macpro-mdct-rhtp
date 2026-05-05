import { getFileBytes } from "utils/api/requestMethods/upload";
import JSZip from "jszip";
import { Report } from "@rhtp/shared";
import { saveAs } from "file-saver";

export const createZipFile = async (report: Report) => {
  const { state, subTypeKey, id, type } = report;

  const files = await getFileBytes(type, state, id);
  var zip = new JSZip();

  for (var i = 0; i < files.length; i++) {
    const blob = convertBase64ToBlob(files[i].bytes);
    zip.file(`${state}/${subTypeKey}/${files[i].name}`, blob);
  }

  zip.generateAsync({ type: "blob" }).then((blob) => {
    saveAs(blob, `RHTP_${state}_${subTypeKey}.zip`);
  });
};

export const convertBase64ToBlob = (base64: string) => {
  const byteCharacters = atob(base64);
  const byteNumbers = [];
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers.push(byteCharacters.charCodeAt(i)); // eslint-disable-line prefer-code-point
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray]);
};
