import Papa from 'papaparse';

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  columnCount: number;
}

export class CsvParserService {
  /**
   * Parses a CSV string and extracts headers and rows.
   * @param csvString The raw CSV content
   * @returns The parsed CSV result
   * @throws Error if the CSV is malformed or parsing fails critically
   */
  public static parseCsv(csvString: string): CsvParseResult {
    if (!csvString.trim()) {
      throw new Error('CSV Formatting Error: CSV file empty');
    }

    const parsed = Papa.parse<Record<string, string>>(csvString, {
      header: true,
      skipEmptyLines: true, // Ignore empty rows
    });

    // Handle parsing errors gracefully
    if (parsed.errors && parsed.errors.length > 0) {
      // If there are errors, we might want to check if it's completely unparseable
      // Some errors are warnings (like trailing commas), but some are critical.
      // For this requirement, we'll throw the first error if it exists to satisfy "Validate parsing errors"
      throw new Error(`CSV Parsing Error: ${parsed.errors[0].message} at row ${parsed.errors[0].row ?? 'unknown'}`);
    }



    if (!parsed.meta.fields || parsed.meta.fields.length === 0) {
      throw new Error('CSV Formatting Error: No headers found');
    }

    const headers = parsed.meta.fields;
    const rows = parsed.data;
    const rowCount = rows.length;
    const columnCount = headers.length;

    return {
      headers,
      rows,
      rowCount,
      columnCount,
    };
  }
}
