import { testUrl, authUrl, generateCookies, privateConfig } from '../../config'
import { HttpClient } from "../httpClient";
import { SessionService } from "../session";
import BaseService from "..";

export class Crm3AuthService extends BaseService {
    protected httpClient: HttpClient = new HttpClient()
    protected privateConfig = privateConfig
    protected url = authUrl
    protected testUrl = testUrl
    protected cookies = generateCookies()
    protected sessionService: SessionService = new SessionService()

    getAuthenticationConfig() {
        const p = privateConfig[0]
        return [p._u, p._p];
    }

    async getCurrentCookies() : Promise<null|string[]> {
        const existingSession = await this.sessionService.getValueOfSession(['sp_session', 'csrf_cookie_name'])
        if (!existingSession) {
            this.logger.info('No existing session found, proceeding with login');
            return null
        }
        this.logger.info('Existing session found, skipping login and continuing with existing session');
        const cookies = Object.entries(existingSession).reduce((acc, [key, value]) => {
            acc.push(`${key}=${value}`);
            return acc;
        }, [] as string[]);
        return cookies
    }

    async testAuthData() : Promise<[boolean, {csrf: string, sp_session: string}|null]> {
        let cookies = await this.getCurrentCookies();
        const existingSession = await this.sessionService.getValueOfSession(['csrf_cookie_name'])
        let currentCsrfToken = existingSession ? existingSession['csrf_cookie_name'] : null
        if (!cookies) {
            cookies = this.cookies[1]
            currentCsrfToken = this.cookies[0]
        }
        const headers = {
            'Cookie': cookies.join('; '),
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'priority': 'u=1, i',
            'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': 'macOS',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-requested-with': 'XMLHttpRequest',
            'Referer': 'https://crm3.ivosights.com/admin'
        }
        const url = this.testUrl + '?csrf_token_name=' + currentCsrfToken
        const response = await this.httpClient.getRequest(url, {
            headers
        });
        if (response.data.indexOf('PT IVONESIA SOLUSI DATA - Login') === -1) {
            this.logger.info('Existing session is valid, no need to login');
            return [true, null];
        }
        this.logger.info('Existing session is invalid, proceeding with login');
        await this.sessionService.setSession(response.headers["set-cookie"] || [])
        const newCsrfToken = response.headers["set-cookie"]?.find(cookie => cookie.startsWith('csrf_cookie_name='))?.split(';')[0].split('=')[1] || existingSession?.['csrf_cookie_name'];
        const newSpSession = response.headers["set-cookie"]?.find(cookie => cookie.startsWith('sp_session='))?.split(';')[0].split('=')[1] || existingSession?.['sp_session'];
        return [false, {csrf: newCsrfToken || '', sp_session: newSpSession || ''}];
    }

    async doLogin() {
        const [isAuthenticated, data] = await this.testAuthData();
        if (isAuthenticated) {
            return;
        }
        const [email, password] = this.getAuthenticationConfig();
        const cookies = [`csrf_cookie_name=${data?.csrf}`, `sp_session=${data?.sp_session}`]
        // Use form-data for the request body
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('csrf_token_name', data?.csrf!);
        formData.append('remember', 'on');
        try {
            const response = await this.httpClient.postRequest(this.url, formData, {
                headers: {
                    'Cookie': cookies.join('; '),
                }
            });
            const isLoginSuccess = response.status === 200 && response.data.indexOf('PT IVONESIA SOLUSI DATA - Login') === -1;
            if (!isLoginSuccess) {
                this.logger.error({ status: response.status }, 'Login failed: Invalid credentials or unexpected response');
                return;
            }
            let responseCookies: string[] = [];
            if (response.headers && typeof response.headers.getSetCookie === 'function') {
                responseCookies = response.headers.getSetCookie();
            } else if (response.headers && Array.isArray(response.headers['set-cookie'])) {
                responseCookies = response.headers['set-cookie'];
            }
            await this.sessionService.setSession(responseCookies)
            this.logger.info({ status: response.status }, 'Login successful');
        } catch (error) {
            this.logger.error({ error }, 'Login failed');
        }
    }
}