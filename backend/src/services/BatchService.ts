export class BatchService {
  /**
   * Splits an array of items into smaller chunks (batches).
   * 
   * @param items The array of items to batch.
   * @param batchSize The maximum size of each batch. Defaults to 20.
   * @returns An array of batches (arrays).
   */
  public static createBatches<T>(items: T[], batchSize: number = 20): T[][] {
    if (batchSize <= 0) {
      throw new Error('Batch size must be greater than 0');
    }

    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return batches;
  }
}
