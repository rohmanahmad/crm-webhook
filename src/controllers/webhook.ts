import { Request, Response } from 'express';
import { LoggerService } from '../services/logger';
import { GithubWebhookService } from '../services/github_webhook';
import { Crm3PostService } from '../services/crm3/postService';

const logger = new LoggerService();
const githubWebhookService: GithubWebhookService = new GithubWebhookService();
const crm3PostService: Crm3PostService = new Crm3PostService();

export async function webhookController(req: Request, res: Response) {
  logger.debug({ body: req.body }, 'Received webhook');
  res.status(200).json({ status: 'ok' });
  try {
    await githubWebhookService.createLogFromWebhookData(req.body);
    const mappedData = await githubWebhookService.getMappedDataFromWebhook('crm3:post:task', req.body);
    for (const taskData of mappedData) {
        const response = await crm3PostService.tryPostTask(taskData)
        if (response && response.id) {
          await crm3PostService.updateStatusToProgress(response.id)
        }
    }
  } catch (err) {
    logger.error(err);
  }
}
