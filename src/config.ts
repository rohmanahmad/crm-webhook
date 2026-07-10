import path from "node:path";

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateCSRFToken = () :string => {
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token.toLocaleLowerCase();
}

const getValueOf = (indexes: number[]): string => {
    let value = '';
    for (const i of indexes) {
        value += chars.charAt(i);
    }
    return value;
}

export const generateCookies = () :[string, string[]]=> {
    const cookies = [];
    const csrfToken = generateCSRFToken();
    cookies.push(`csrf_cookie_name=${csrfToken}`);
    return [csrfToken, cookies];
}
const domain = getValueOf([8, 21, 14, 18, 8, 6, 7, 19, 18]) + '.' + getValueOf([2, 14, 12])
const scheme = getValueOf([7, 19, 19, 15, 18]) + '://'
export const baseUrl = scheme + 'crm3.' + domain
export const authUrl = baseUrl + '/admin/authentication'
export const privateConfig = [
    {
        _u: getValueOf([17, 14, 7, 12, 0, 13]) + '@' + domain,
        _p: getValueOf([17, 14, 7, 12, 0, 13, 0, 7, 12, 0, 3, 53, 54, 55])
    }
]
export const sessionPathFile = path.resolve('./data/session.txt');
export const testUrl = baseUrl + '/admin/misc/set_setup_menu_open';
export const githubUserMappingToCrm3: Record<string, number> = {
    'rohmanahmad': 30,
    'radinalade15': 45,
    'terusterang': 54,
    'edomaru': 57,
    'Meynisa': 40,
    'rhandypratama': 46,
    'zafranf': 50,
};
export const githubWebhookLogPath = path.resolve('./data/github_webhook.txt')
export const crm3LogPath = path.resolve('./data/person/account_[UserId].txt')