import { deleteBanner, putBanner, scanAllBanners } from "./banners";
import { mockClient } from "aws-sdk-client-mock";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { BannerAreas, BannerShape } from "@rhtp/shared";

const mockDynamo = mockClient(DynamoDBDocumentClient);

const mockBanner: BannerShape = {
  title: "mock title",
  area: BannerAreas.RHTP,
  description: "mock description",
  link: "https://example.com",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  key: "mock-existing-banner-key-guid",
  createdAt: "1998-01-01T00:00:00.123Z",
  createdBy: "prev username",
};

describe("Banner storage methods", () => {
  beforeEach(() => {
    mockDynamo.reset();
  });

  test("should call Dynamo to create a new or updated banner", async () => {
    const mockPut = vi.fn();
    mockDynamo.on(PutCommand).callsFakeOnce(mockPut);

    await putBanner(mockBanner);

    expect(mockPut).toHaveBeenCalledWith(
      {
        TableName: "local-banners",
        Item: mockBanner,
      },
      expect.any(Function)
    );
  });

  test("should call Dynamo to scan all banners", async () => {
    const mockScan = vi
      .fn()
      .mockResolvedValueOnce({ Items: [mockBanner], LastEvaluatedKey: "foo" })
      .mockResolvedValueOnce({ Items: [mockBanner] });

    mockDynamo.on(ScanCommand).callsFakeOnce(mockScan).callsFakeOnce(mockScan);

    const banner = await scanAllBanners();

    expect(banner).toEqual([mockBanner, mockBanner]);
    expect(mockScan).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-banners",
      }),
      expect.any(Function)
    );
  });

  test("should call Dynamo to delete a banner", async () => {
    const mockDelete = vi.fn();
    mockDynamo.on(DeleteCommand).callsFakeOnce(mockDelete);

    await deleteBanner("mock-key");

    expect(mockDelete).toHaveBeenCalledWith(
      {
        TableName: "local-banners",
        Key: { key: "mock-key" },
      },
      expect.any(Function)
    );
  });
});
