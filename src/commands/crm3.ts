import BaseCommand from ".";
import { Crm3AuthService } from "../services/crm3/authService";
import { Crm3PostService } from "../services/crm3/postService";
import { GithubWebhookService } from "../services/github_webhook";

export default class Crm3 extends BaseCommand {
  public static command = 'crm3';
  public static description = 'Run CRM3 tests';

  protected crm3AuthService: Crm3AuthService = new Crm3AuthService();
  protected crm3PostService: Crm3PostService = new Crm3PostService();
  protected githubWebhookService: GithubWebhookService = new GithubWebhookService();
//   protected httpClientService: HttpClient = new HttpClient();
//   protected sessionService: SessionService = new SessionService();

  public async run(options?: Record<string, any>) {
    this.logger.info('Running CRM3 tests...');
    await this.crm3AuthService.doLogin();
    if (options?.testPostTask) {
      await this.testPostTask();
    }
    if (options?.testGithubWebhook) {
      await this.testGithubWebhook();
    }
  }

  private async testGithubWebhook() {
    const sampleData = await this.githubWebhookService.getSampleWebhookData();
    await this.githubWebhookService.createLogFromWebhookData(sampleData);
    const mappedData = await this.githubWebhookService.getMappedDataFromWebhook('crm3:post:task', sampleData);
    for (const taskData of mappedData) {
        const response = await this.crm3PostService.tryPostTask(taskData)
        if (response && response.id) {
          await this.crm3PostService.updateStatusToProgress(response.id)
        }
    }
  }

  private async testPostTask() {
    await this.crm3PostService.tryPostTask({
          'csrf_token_name':'--csrf_token_name--',
          'name':'[R10-API] Task #3 ',
          'hourly_rate':0,
          'startdate':'21-02-2026',
          'duedate':'21-02-2026',
          'priority':2,
          'assignees[]':30,
          'followers[]':30,
          'tags':'Feb-2026,ripple10,r10-api,feature',
          'custom_fields[tasks][2]':'Development',
          'custom_fields[tasks][40]':'Tech',
          'custom_fields[tasks][58]':'1 SP',
          'description':'<p>r10-task description</p>',
      })
  }
}