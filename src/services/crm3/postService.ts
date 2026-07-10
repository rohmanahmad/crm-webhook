import BaseService from "..";
import { baseUrl } from "../../config";
import { tryJsonParse } from "../../helpers/utilities";
import { HttpClient } from "../httpClient";
import { SessionService } from "../session";

interface TaskData {
    csrf_token_name: string
    name: string
    hourly_rate: number
    startdate: string
    duedate: string
    priority: number
    'assignees[]': number
    'followers[]': number
    tags: string
    'custom_fields[tasks][2]': string
    'custom_fields[tasks][40]': string
    'custom_fields[tasks][58]': string
    description: string
}

export class Crm3PostService extends BaseService{
    protected httpClient: HttpClient = new HttpClient()
    protected sessionService: SessionService = new SessionService()
    
    protected postTaskUrl = baseUrl + '/admin/tasks/task'
    async tryPostTask(taskData: TaskData) {
        const url = this.postTaskUrl;
        const formData = new FormData()
        const cookies = await this.sessionService.getValueOfSession(['csrf_cookie_name', 'sp_session'])
        if (!cookies) {
            this.logger.error('No session found, cannot post task');
            return null
        }
        taskData.csrf_token_name = cookies['csrf_cookie_name'] || '' // patching the csrf token from session to task data
        for (const [key, value] of Object.entries(taskData)) {
            formData.append(key, value.toString())
        }
        const response = await this.httpClient.postRequest(url, formData, {
            headers: {
                'Cookie': [`csrf_cookie_name=${cookies['csrf_cookie_name']}`, `sp_session=${cookies['sp_session']}`].join('; ')
            }
        });
        return response.data
    }

    async updateStatusToProgress(taskId: number) {
        const cookies = await this.sessionService.getValueOfSession(['csrf_cookie_name', 'sp_session'])
        const csrf = cookies ? cookies['csrf_cookie_name'] : ''
        const url = baseUrl + `/admin/tasks/mark_as/4/${taskId}?single_task=true&csrf_token_name=${csrf}` // 4: in CRM3 is the status id for "In Progress"
        if (!cookies) {
            this.logger.error('No session found, cannot update task status');
            return null
        }
        const response = await this.httpClient.getRequest(url, {
            headers: {
                'Cookie': [`csrf_cookie_name=${cookies['csrf_cookie_name']}`, `sp_session=${cookies['sp_session']}`].join('; ')
            }
        });
        if (response && response.data && response.data.message) {
            this.logger.info(`TaskId: ${taskId}, Message: ${response.data.message}`);
        }
        return response.data
    }
}