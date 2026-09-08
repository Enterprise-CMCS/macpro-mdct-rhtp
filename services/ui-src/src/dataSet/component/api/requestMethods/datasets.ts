import { apiLib } from "utils";
import { getRequestHeaders } from "utils/api/requestMethods/getRequestHeaders";

//TODO: Merge in shared folder when files are in their own repo
export type DataSetType = {
  key?: string;
  name: string;
  status: boolean;
  createdAt?: string;
  createdBy?: string;
};

export async function createDataSet(dataSetData: {
  name: string;
  status: Boolean;
}) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...dataSetData },
  };

  return await apiLib.post<{ name: string; status: Boolean }>(
    "/datasets",
    options
  );
}

export async function getDataSets() {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.get<DataSetType[]>("/datasets", options);
}

export async function updateDataSet(dataSetData: DataSetType) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...dataSetData },
  };

  console.log(options);

  return await apiLib.put(`/datasets/${dataSetData.key}`, options);
}
