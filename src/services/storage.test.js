import { getPublicReviews } from './storage';

describe('getPublicReviews', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns fallback reviews when the backend reviews endpoint is unavailable', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Not Found' }),
    });

    const reviews = await getPublicReviews();

    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews[0]).toEqual(
      expect.objectContaining({
        customer_name: expect.any(String),
        description: expect.any(String),
        rating: expect.any(Number),
      })
    );
  });
});
