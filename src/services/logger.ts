import pino, { Logger } from 'pino';

export class LoggerService {
  private logger: Logger;

  constructor() {
    if (process.env.OTEL_ENABLED === 'true') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { NodeSDK } = require('@opentelemetry/sdk-node');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
      // pino-opentelemetry-transport is required for the transport target, but does not need to be imported here

      const sdk = new NodeSDK({
        instrumentations: [getNodeAutoInstrumentations()]
      });
      sdk.start();
      this.logger = pino({
        transport: {
          target: 'pino-opentelemetry-transport',
          options: {}
        }
      });
    } else {
      this.logger = pino();
    }
  }

  info(...args: [obj: unknown, msg?: string, ...params: unknown[]]) {
    this.logger.info(...args);
  }

  error(...args: [obj: unknown, msg?: string, ...params: unknown[]]) {
    this.logger.error(...args);
  }

  warn(...args: [obj: unknown, msg?: string, ...params: unknown[]]) {
    this.logger.warn(...args);
  }

  debug(...args: [obj: unknown, msg?: string, ...params: unknown[]]) {
    this.logger.debug(...args);
  }

  // Add more methods as needed
}
