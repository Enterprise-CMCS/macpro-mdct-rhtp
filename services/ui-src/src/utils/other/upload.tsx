import { getUrl, uploadData } from "aws-amplify/storage";
import React, { useState } from "react";

export const createSafeS3Key = (s: string) => {
  console.log("createSafeS3Key");
  return encodeURIComponent(s)
    .replace(/\*/g, "%2A")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
};

const uploadFile = async (file: any) => {
  console.log("upload File");

  const fileToUpload = file;

  let retPromise;
  const targetPathname = `${Date.now()}/${createSafeS3Key(fileToUpload.name)}`;

  console.log("targetPathname", targetPathname);

  try {
    const stored = await uploadData({
      key: targetPathname,
      data: fileToUpload,
      options: {
        contentType: fileToUpload.type,
        // onProgress: ({ transferredBytes, totalBytes }) => {
        //   const progressRatio = (transferredBytes / totalBytes!) * 100;
        //   // setUploadStatus(progressRatio);
        // },
      },
    }).result;

    const res = await getUrl({ key: stored.key });
    const url = await res.url;

    let result = {
      s3Key: `public/${stored.key}`,
      filename: fileToUpload.name,
      contentType: fileToUpload.type,
      url: url, //We only need the permalink part of the URL since the S3 bucket policy allows for public read
    };

    retPromise = Promise.resolve(result);
  } catch (error) {
    console.log(error);
    retPromise = Promise.reject(error);
  }

  return retPromise;
};

async function uploadFiles(fileArray: any[]) {
  let resultPromise;
  if (fileArray.length > 0) {
    // Process each file.
    let uploadPromises: any[] = [];
    fileArray.forEach((file: any) => {
      let promise = uploadFile(file);
      uploadPromises.push(promise);
    });

    //Wait until all files are uploaded.
    resultPromise = new Promise((resolve, reject) => {
      Promise.all(uploadPromises)
        .then((results) => {
          resolve(results);
        })
        .catch((error) => {
          if (error) {
            reject("There was an error uploading your file");
          }
        });
    });
  } else {
    // Since we have no files then we are successful.
    Promise.resolve();
  }

  return resultPromise;
}

export const uploadToBucket = async (acceptedFiles: File[]) => {
  await uploadFiles(acceptedFiles)
    .then((result: any) => {
      console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
};
