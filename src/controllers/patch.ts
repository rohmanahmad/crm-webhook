import { Request, Response } from 'express';
import { LoggerService } from '../services/logger';
import { SessionService } from '../services/session';
import { tryJsonParse } from '../helpers/utilities';

const logger = new LoggerService();

export async function patchController(req: Request, res: Response) {
  logger.debug({ body: req.body }, 'Received Patch Session Request');
  try {
    const patch = req.query.patch as string;
    const parsedPatch = tryJsonParse(patch || '{}')
    const sessionService = new SessionService();
    const session = await sessionService.patchSessionData(parsedPatch[1]);
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to patch session' });
  }
}
