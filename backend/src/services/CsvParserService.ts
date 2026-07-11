import Papa from 'papaparse';

export interface SkippedRow {
  row: number;
  type: string;
  message: string;
}

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  columnCount: number;
  skippedRows: SkippedRow[];
}

export class CsvParserService {
  /**
   * Parses a CSV string and extracts headers and rows.
   * @param csvString The raw CSV content
   * @returns The parsed CSV result
   * @throws Error if the CSV is completely empty or missing headers
   */
  public static parseCsv(csvString: string): CsvParseResult {
    if (!csvString.trim()) {
      throw new Error('CSV Formatting Error: CSV file empty');
    }

    const parsed = Papa.parse<Record<string, string>>(csvString, {
      header: true,
      skipEmptyLines: true, // Ignore empty rows
    });

    const skippedRows: SkippedRow[] = [];
    const errorRowIndices = new Set<number>();

    // Collect row-level errors
    if (parsed.errors && parsed.errors.length > 0) {
      for (const err of parsed.errors) {
        if (err.row !== undefined) {
          if (!errorRowIndices.has(err.row)) {
            skippedRows.push({
              row: err.row,
              type: err.code || err.type, // Map PapaParse 'code' (e.g. TooFewFields) to type
              message: err.message
            });
            errorRowIndices.add(err.row);
          }
        }
      }
    }

    if (!parsed.meta.fields || parsed.meta.fields.length === 0) {
      throw new Error('CSV Formatting Error: No headers found');
    }

    const headers = parsed.meta.fields;
    const validRows = parsed.data.filter((_, index) => !errorRowIndices.has(index));
    const rowCount = validRows.length;
    const columnCount = headers.length;

    return {
      headers,
      rows: validRows,
      rowCount,
      columnCount,
      skippedRows,
    };
  }
}
