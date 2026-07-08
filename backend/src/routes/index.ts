import { Router } from 'express';
import importRoutes from './import.routes';

const router = Router();

// Add your feature routes here
router.use('/', importRoutes);

export default router;
