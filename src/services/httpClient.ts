import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';

export class HttpClient {
  private _axios: AxiosInstance;
  private _config: AxiosRequestConfig;

  constructor(baseURL = '') {
    this._axios = axios.create({ baseURL });
    this._config = {};
  }

  set<K extends keyof AxiosRequestConfig>(key: K, value: AxiosRequestConfig[K]): this {
    this._config[key] = value;
    return this;
  }

  get<K extends keyof AxiosRequestConfig>(key: K): AxiosRequestConfig[K] {
    return this._config[key];
  }

  async request<T = any>(method: Method, url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    const mergedConfig: AxiosRequestConfig = { ...this._config, ...config, method, url, data };
    return this._axios.request<T>(mergedConfig);
  }

  async getRequest<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.request<T>('get', url, {}, config);
  }

  async postRequest<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.request<T>('post', url, data, config);
  }

  // Add more HTTP methods as needed
}
