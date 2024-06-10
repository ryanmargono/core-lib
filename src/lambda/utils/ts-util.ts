export const async = async <T>(
  func: Promise<T>
): Promise<[T | null, Error | null]> => {
  try {
    const data = await func;
    return [data, null];
  } catch (error) {
    return [null, error as Error];
  }
};
