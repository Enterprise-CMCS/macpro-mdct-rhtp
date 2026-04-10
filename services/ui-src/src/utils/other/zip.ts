import { getZip } from "utils/api/requestMethods/upload";
import JSZip from "jszip";

export const testZip = async (state: string) => {
  const test = await getZip("2026", state!);
  var zip = new JSZip();
  for (var i = 0; i < test.bytes.length; i++) {
    zip.file("nested/image" + i + ".png", test.bytes[i], { base64: true });
  }

  zip.generateAsync({ type: "base64" }).then(function (base64) {
    location.href = "data:application/zip;base64," + base64;
  });
};
