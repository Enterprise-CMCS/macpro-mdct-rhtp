import { geFileBytes } from "utils/api/requestMethods/upload";
import JSZip from "jszip";
import { Report, RhtpSubType } from "types";
import { saveAs } from "file-saver";

export const createZipFile = async (report: Report) => {
  const { state, year, subType } = report;
  const quarter = RhtpSubType[subType!];

  const fileId = `${quarter}_${year}`;
  const files = await geFileBytes(year.toString(), state, fileId);
  var zip = new JSZip();

  for (var i = 0; i < files.length; i++) {
    const blob = convertBase64ToBlob(files[i].bytes);
    zip.file(`${state}/${year}/${quarter}/${files[i].name}`, blob);
  }

  zip.generateAsync({ type: "blob" }).then((blob) => {
    saveAs(blob, `RHTP_${state}_${year}.zip`);
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
