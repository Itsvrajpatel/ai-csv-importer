import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const importCsv = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Access the uploaded file from req.file (Multer populates this)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or invalid file format',
      });
    }

    // At this point, the file is in memory and validated as a CSV by Multer
    // File data is accessible via req.file.buffer
    logger.info(`Successfully received CSV file: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // We do not parse the CSV yet, as per requirements.
    // Return success
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
