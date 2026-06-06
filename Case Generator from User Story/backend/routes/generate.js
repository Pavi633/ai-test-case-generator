import { Router } from 'express';
import { generateController, healthController } from '../controllers/generateController.js';

const router = Router();

router.post('/generate', generateController);
router.get('/health', healthController);

export default router;
