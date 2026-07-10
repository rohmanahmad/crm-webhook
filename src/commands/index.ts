import { LoggerService } from "../services/logger";

export default class BaseCommand {
    protected logger: LoggerService = new LoggerService();

    public static command: string;
    public static description: string;

    public static async run() {
        throw new Error("Run method not implemented");
    }

    public help() {
        console.log('==='.repeat(12) + ' Command Help ' + '==='.repeat(12) + '=');
        console.log('| Command:', (this.constructor as typeof BaseCommand).command);
        console.log('| Description:', (this.constructor as typeof BaseCommand).description);
        console.log('==='.repeat(13) + '  ::  ' + '==='.repeat(14));
    }
}