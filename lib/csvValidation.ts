import Papa from "papaparse";
import { ParsedData } from "@/components/wizard/types";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  parsedData?: ParsedData;
}

export function validateCSV(file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ isValid: false, error: "No file selected." });
      return;
    }

    if (file.size === 0) {
      resolve({ isValid: false, error: "File is empty (0 bytes)." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      resolve({ isValid: false, error: "File exceeds the 5 MB limit." });
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      resolve({ isValid: false, error: "Invalid file extension. Please upload a CSV file." });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          // If there are parsing errors and no data could be extracted
          resolve({ isValid: false, error: "Corrupted CSV: " + results.errors[0].message });
          return;
        }

        const headers = results.meta.fields || [];
        
        if (headers.length === 0) {
          resolve({ isValid: false, error: "Missing headers in CSV." });
          return;
        }

        // Check for duplicate headers
        const uniqueHeaders = new Set(headers);
        if (uniqueHeaders.size !== headers.length) {
          resolve({ isValid: false, error: "Duplicate headers found in CSV." });
          return;
        }

        const rows = results.data as Record<string, any>[];

        resolve({ 
          isValid: true, 
          parsedData: { headers, rows } 
        });
      },
      error: (error) => {
        resolve({ isValid: false, error: "Failed to parse CSV: " + error.message });
      }
    });
  });
}
