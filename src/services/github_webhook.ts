import { appendFile } from "node:fs/promises";
import BaseService from ".";
import { crm3LogPath, githubUserMappingToCrm3, githubWebhookLogPath } from "../config";
import { getCurrentDate, getCurrentMonthYear } from "../helpers/date";
import { PushEventData, sampleData } from "./github/push_data";

type AcceptedTargetmap = 'crm3:post:task' | 'crm3:update_status:task'

export class GithubWebhookService extends BaseService {
    async getSampleWebhookData() {
        return sampleData
    }
    async getMappedDataFromWebhook(targetMap: AcceptedTargetmap, pushEventWebhookData: PushEventData) {
        let data = []
        switch (targetMap) {
            case 'crm3:post:task':
                data = this.mapPushEventToCrm3TaskData(pushEventWebhookData)
            break
            default:
                throw new Error('Unsupported target map')
        }
        return data
    }

    private mapPushEventToCrm3TaskData(pushEventWebhookData: PushEventData) {
        const repoName = pushEventWebhookData.repository.name;
        const branchName = pushEventWebhookData.ref.replace('refs/heads/', '');
        const commitType = branchName.split('/')[0];
        const currentMonth = getCurrentMonthYear()
        const taskItems = []
        if (repoName && branchName && commitType && ['main', 'master', 'development'].indexOf(branchName) === -1) {
            for (const commit of pushEventWebhookData.commits) {
                const author = commit.author.username;
                const crm3UserId = githubUserMappingToCrm3[author] || 0; // default to 0 if user not found in mapping
                if (crm3UserId === 0) {
                    this.logger.warn(`No CRM3 user mapping found for GitHub user: ${author}. Skipping task creation for this commit.`);
                    continue; // skip this commit if no mapping found
                }
                const fileToAdded = commit.added ? commit.added.map(file => `<li>${file}</li>`) : null;
                const fileToModified = commit.modified ? commit.modified.map(file => `<li>${file}</li>`) : null;
                const fileToRemoved = commit.removed ? commit.removed.map(file => `<li>${file}</li>`) : null;
                const commitUrl = commit.url
                const commitMessage = commit.message
                const description = [
                    `<p>Commit by ${author}</p>`,
                    `<br/><b>Files added:</b> <ol>${fileToAdded ? fileToAdded.join('') : ''}</ol>`,
                    `<br/><b>Files modified:</b> <ol>${fileToModified ? fileToModified.join('') : ''}</ol>`,
                    `<br/><b>Files removed:</b> <ol>${fileToRemoved ? fileToRemoved.join('') : ''}</ol>`,
                    `<p>View commit on GitHub: <a href="${commitUrl}">${commitUrl}</a></p>`
                ]
                const taskItem = {
                    'csrf_token_name':'--csrf_token_name--',
                    'name':`[${repoName}] ${commitType} - ${commitMessage}`,
                    'hourly_rate': 0,
                    'startdate': getCurrentDate(),
                    'duedate': getCurrentDate(1),
                    'priority': 2,
                    'assignees[]': crm3UserId,
                    'followers[]': crm3UserId,
                    'tags': `${currentMonth},${commitType},${repoName}`,
                    'custom_fields[tasks][2]': commitType === 'hotfix' ? 'Bugs' : 'Development',
                    'custom_fields[tasks][40]': 'Tech',
                    'custom_fields[tasks][58]': commitType === 'hotfix' ? '1 SP' : '2 SP',
                    'description': description.join('')
                }
                taskItems.push(taskItem)
            }
        }
        this.updateLogData(taskItems).catch(err => this.logger.error('Error updating log data', err));
        return taskItems
    }

    async createLogFromWebhookData(webhookData: any) {
        this.logger.info('Received webhook data');
        await appendFile(githubWebhookLogPath, JSON.stringify(webhookData) + '\n');
    }

    async updateLogData(logData: any) {
        this.logger.info('Updating log data');
        for (const data of logData) {
            const userId = data['assignees[]'];
            const userLogPath = crm3LogPath.replace('[UserId]', userId);
            try {
                await appendFile(userLogPath, JSON.stringify(data) + '\n');
            } catch (err) {
                this.logger.info(`Failed to write log data for user ${userId}`);
                this.logger.warn(`Log path: ${userLogPath}`);
                this.logger.error((err as Error).message);
            }
        }
    }
}