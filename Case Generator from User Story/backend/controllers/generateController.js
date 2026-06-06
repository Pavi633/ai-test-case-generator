import { generateAndSave } from '../services/generateService.js';
import { checkOllamaHealth } from '../services/ollamaService.js';

const ALLOW_FALLBACK = process.env.ALLOW_FALLBACK !== 'false';

export async function generateController(req, res) {
  try {
    const { userStory } = req.body;

    if (!userStory || typeof userStory !== 'string') {
      return res.status(400).json({ error: 'userStory is required and must be a string' });
    }

    const health = await checkOllamaHealth();

    if (!health.available && !ALLOW_FALLBACK) {
      return res.status(503).json({
        error: 'Ollama is not running. Start it with: ollama serve',
        hint: 'Install from https://ollama.com, run: ollama pull llama3, then: ollama serve',
        ollamaInstalled: false,
      });
    }

    const result = await generateAndSave(userStory, { useFallback: !health.available }, req.user.userId);

    if (!health.available) {
      result.source = 'fallback';
      result.warning =
        'Ollama is not running. Test cases were generated using the local fallback engine. Install Ollama for AI-powered generation.';
    } else {
      result.source = 'ollama';
    }

    res.json(result);
  } catch (error) {
    console.error('Generate error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate test cases' });
  }
}

export async function healthController(req, res) {
  const ollama = await checkOllamaHealth();
  res.json({
    status: 'ok',
    ollama,
    model: process.env.OLLAMA_MODEL || 'llama3',
    fallbackEnabled: ALLOW_FALLBACK,
  });
}
