import { Router } from 'express';
import { getDashboardStats, getDashboardRecent } from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/recent', getDashboardRecent);

export default router;
