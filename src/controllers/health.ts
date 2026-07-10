import { Request, Response } from 'express';
import { LoggerService } from '../services/logger';

const logger = new LoggerService();

export function healthController(req: Request, res: Response) {
  logger.info('Health check requested');
  res.status(200).json({ status: 'healthy' });
}
