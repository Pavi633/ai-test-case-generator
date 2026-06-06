import { getHistory, getHistoryById, deleteHistory } from '../services/generateService.js';

export function listHistoryController(req, res) {
  try {
    const search = req.query.search || '';
    const history = getHistory(search, req.user.userId);
    res.json(history);
  } catch (error) {
    console.error('History list error:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
}

export function getHistoryController(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid history ID' });
    }

    const item = getHistoryById(id, req.user.userId);
    if (!item) {
      return res.status(404).json({ error: 'History item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('History get error:', error.message);
    res.status(500).json({ error: 'Failed to fetch history item' });
  }
}

export function deleteHistoryController(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid history ID' });
    }

    const deleted = deleteHistory(id, req.user.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'History item not found' });
    }

    res.json({ success: true, message: 'History item deleted' });
  } catch (error) {
    console.error('History delete error:', error.message);
    res.status(500).json({ error: 'Failed to delete history item' });
  }
}
