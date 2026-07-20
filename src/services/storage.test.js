import { getPublicReviews } from "./storage";

describe("getPublicReviews", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns active reviews from the backend", async () => {
    const backendReviews = [
      {
        id: 1,
        customer_name: "Customer",
        description: "Great product",
        rating: 5,
        is_active: true,
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => backendReviews,
    });

    await expect(getPublicReviews()).resolves.toEqual(
      backendReviews
    );
  });

  it("throws a useful error when reviews cannot be loaded", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({
        detail: "Reviews service unavailable",
      }),
    });

    await expect(getPublicReviews()).rejects.toThrow(
      "Reviews service unavailable"
    );
  });
});
