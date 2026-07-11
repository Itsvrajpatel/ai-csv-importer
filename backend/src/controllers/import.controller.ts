import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { CsvParserService } from '../services/CsvParserService';
import { BatchService } from '../services/BatchService';
import { PromptBuilderService } from '../prompts/crmPrompt';
import { GeminiService } from '../services/GeminiService';
import { CRMLead } from '../validators/crmLead.validator';

export const importCsv = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  try {
    logger.info('Import started');

    if (!req.file) {
      logger.warn('Import attempted with no file or invalid file type');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or invalid file format. Only .csv files are accepted.',
      });
    }

    const { originalname, size, buffer } = req.file;
    const csvString = buffer.toString('utf-8');

    // 1. Parse CSV (Parser handles empty checks and structure validation)
    const parsedData = CsvParserService.parseCsv(csvString);
    logger.info('CSV parsed');
    logger.info(`Valid rows: ${parsedData.rowCount}`);
    logger.info(`Skipped rows: ${parsedData.skippedRows.length}`);

    if (parsedData.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid rows were found in the uploaded CSV.',
      });
    }

    // 2. Split rows into batches
    const rawBatchSize = parseInt(req.query.batchSize as string, 10);
    const batchSize = isNaN(rawBatchSize) ? 10 : rawBatchSize;
    
    const batches = BatchService.createBatches(parsedData.rows, batchSize);

    logger.info({
      fileName: originalname,
      fileSize: size,
      totalRows: parsedData.rowCount + parsedData.skippedRows.length,
      totalColumns: parsedData.columnCount,
      batchCount: batches.length,
    }, 'Successfully processed CSV upload into batches, starting Gemini extraction...');
    logger.info(`Batch count: ${batches.length}`);

    // 3. Process batches sequentially through Gemini
    let successfulBatches = 0;
    let failedBatches = 0;
    let skipped = parsedData.skippedRows.length;
    const warnings: string[] = [];
    const records: CRMLead[] = [];

    // Pre-populate warnings with skipped row messages
    for (const skippedRow of parsedData.skippedRows) {
      warnings.push(`Row ${skippedRow.row} skipped because ${skippedRow.message}`);
    }
    
    if (warnings.length > 0) {
      logger.info(`Warnings: ${warnings.length}`);
    }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(`Starting Batch ${i + 1}/${batches.length}`);
      
      try {
        const { system, user } = PromptBuilderService.buildCrmPrompt(parsedData.headers, batch);
        const crmLeads = await GeminiService.extractCRMData(system, user);
        
        records.push(...crmLeads);
        successfulBatches++;
        skipped += (batch.length - crmLeads.length);
        logger.info(`Batch ${i + 1} completed`);
        logger.info(`Batch progress: ${i + 1}/${batches.length}`);
      } catch (batchError: any) {
        failedBatches++;
        warnings.push(`Batch ${i + 1} failed: ${batchError.message}`);
        logger.error(`Batch ${i + 1} failed: ${batchError.message}`);
        logger.info(`Batch progress: ${i + 1}/${batches.length}`);
        // We do NOT throw here; we continue processing the next batch.
      }
    }

    const processingTime = Date.now() - startTime;
    const imported = records.length;

    logger.info('Import completed');
    logger.info(`Imported count: ${imported}`);
    logger.info(`Skipped count: ${skipped}`);
    logger.info(`Processing time: ${processingTime}ms`);

    // 4. Return final aggregated JSON response
    return res.status(200).json({
      success: true,
      totalRows: parsedData.rowCount + parsedData.skippedRows.length,
      imported,
      skipped,
      failedBatches,
      successfulBatches,
      processingTime,
      records,
      warnings,
      skippedRows: parsedData.skippedRows,
    });
    
  } catch (error: any) {
    logger.error(`CSV Import Error: ${error.message}`);
    
    // Check if it's a known formatting error from our parser to send 400 Bad Request
    if (error.message && (error.message.includes('CSV Formatting Error') || error.message.includes('CSV Parsing Error'))) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Otherwise pass to global error handler
    next(error);
  }
};
