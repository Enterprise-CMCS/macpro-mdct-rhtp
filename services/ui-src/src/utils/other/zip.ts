import { geFileBytes } from "utils/api/requestMethods/upload";
import JSZip from "jszip";
import { Report, RhtpSubType } from "types";

export const createZipFile = async (report: Report) => {
  const { state, year, subType } = report;
  const quarter = RhtpSubType[subType!];

  const fileId = `${quarter}_${year}`;
  const files = await geFileBytes(year.toString(), state, fileId);
  var zip = new JSZip();

  for (var i = 0; i < files.length; i++) {
    zip.file(`${state}/${year}/${quarter}/${files[i].name}`, files[i].bytes, {
      base64: true,
    });
  }
  zip.generateAsync({ type: "base64" }).then(function (base64) {
    location.href = "data:application/zip;base64," + base64;
  });
};
