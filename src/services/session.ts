import { readFile, writeFile } from "node:fs/promises";
import { sessionPathFile } from "../config";

const acceptedCookieKeys = ['csrf_cookie_name', 'sp_session']

export class SessionService {
    protected sessionPath = sessionPathFile

    async setSession(data: string[]) {
        const oldSession = await this.getSession()
        const newSessionData = this.parsingSessionData(data)
        const mergedSession = {
            ...oldSession,
            ...newSessionData
        }
        await writeFile(this.sessionPath, JSON.stringify(mergedSession), 'utf-8')
    }

    parsingSessionData(data: string[]): Record<string, string> {
        const sessionData: Record<string, string> = {}
        for (const cookie of data) {
            const [cookieKey, cookieValue] = cookie.split('=');
            if (acceptedCookieKeys.includes(cookieKey.trim())) {
                sessionData[cookieKey.trim()] = cookieValue.trim().split(';')[0]
            }
        }
        return sessionData
    }

    async getSession(): Promise<Record<string, string>> {
        const data = await readFile(this.sessionPath, 'utf-8')
        try {
            return JSON.parse(data) as Record<string, string>
        } catch {
            return {}
        }
    }

    async getValueOfSession(keys: string[]): Promise<Record<string, string | null> | null> {
        const sessionData = await this.getSession();
        const keyResults: Record<string, string | null> = {}
        for (const key of keys) {
            if (sessionData[key]) {
                keyResults[key] = sessionData[key]
            } else {
                keyResults[key] = null
            }
        }
        return keyResults
    }
}