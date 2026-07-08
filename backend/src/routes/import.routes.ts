import { Router } from 'express';
import { importCsv } from '../controllers/import.controller';
import { upload } from '../middleware/upload';
import multer from 'multer';

const router = Router();

// Wrap the multer upload middleware to catch Multer-specific errors (like file size limits or file filter errors)
router.post('/import', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading (e.g. LIMIT_FILE_SIZE)
      return res.status(413).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      // An unknown error occurred or file filter error
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    // Everything went fine, move to the controller
    next();
  });
}, importCsv);

export default router;
