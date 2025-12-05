// src/routes/performanceRoutes.ts

import { Router } from 'express';
import { getPerformanceMetrics } from '../controllers/performanceController';

const router = Router();

// Endpoint: GET /api/performance/:workspaceId
router.get('/:workspaceId', getPerformanceMetrics);

export default router;