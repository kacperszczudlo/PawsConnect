export const runBatchUpdates = async (
  queries: Array<PromiseLike<{ error: any; count?: number | null; data?: Array<any> | null }> | null>,
) => {
  const pending = queries.filter(
    (q): q is PromiseLike<{ error: any; count?: number | null; data?: Array<any> | null }> => q != null,
  );
  const results = await Promise.all(pending);
  const errors = results.map((result) => result.error).filter(Boolean);
  const totalUpdated = results.reduce((acc, result) => {
    if (typeof result.count === 'number') {
      return acc + result.count;
    }

    if (Array.isArray(result.data)) {
      return acc + result.data.length;
    }

    return acc;
  }, 0);

  return { errors, totalUpdated };
};
