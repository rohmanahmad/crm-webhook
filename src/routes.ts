import { Router } from 'express';

const router = Router();

// Webhook endpoint (lazy-loaded)
router.post('/webhook', async (req, res, next) => {
  try {
    const { webhookController } = await import('./controllers/webhook');
    await webhookController(req, res);
  } catch (err) {
    next(err);
  }
});

// Health check endpoint (lazy-loaded)
router.get('/health', async (req, res, next) => {
  try {
    const { healthController } = await import('./controllers/health');
    healthController(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
