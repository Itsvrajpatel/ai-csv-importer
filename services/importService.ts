import axios, { AxiosError } from 'axios';

export interface ImportResponse {
  success: boolean;
  message?: string;
  data?: any; 
}

export class ImportServiceError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'ImportServiceError';
  }
}

/**
 * Uploads a CSV file to the backend API.
 * 
 * @param file - The CSV file to upload
 * @returns A promise that resolves to the typed API response
 * @throws {ImportServiceError} If network error, timeout, or server error occurs
 */
export const importCSV = async (file: File): Promise<ImportResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<ImportResponse>('/api/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds timeout
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      
      if (axiosError.code === 'ECONNABORTED') {
        throw new ImportServiceError('The request timed out. Please try again.', error);
      } else if (!axiosError.response) {
        throw new ImportServiceError('Network error. Please check your connection.', error);
      } else {
        const serverMessage = axiosError.response.data?.message || 'Server error occurred during import.';
        throw new ImportServiceError(`Import failed: ${serverMessage}`, error);
      }
    }
    
    throw new ImportServiceError('An unexpected error occurred while importing the file.', error);
  }
};
