import './requirements'
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

import { LoggerService } from './services/logger';
import routes from './routes';

const logger = new LoggerService();

const app = express();

// Security and performance middlewares
app.use(helmet());
app.use(compression());
app.use(cors());

// Body parser for JSON and urlencoded
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Use routes
app.use(routes);

// Global error handler (latest handler)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  logger.info(`Webhook server running on port ${PORT}`);
});
