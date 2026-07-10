import { LoggerService } from "./logger";
export default class BaseService {
    protected logger: LoggerService = new LoggerService();
}