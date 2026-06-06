import { Router } from 'express';
import {
  listHistoryController,
  getHistoryController,
  deleteHistoryController,
} from '../controllers/historyController.js';

const router = Router();

router.get('/', listHistoryController);
router.get('/:id', getHistoryController);
router.delete('/:id', deleteHistoryController);

export default router;
