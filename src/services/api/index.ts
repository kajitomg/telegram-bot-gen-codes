import cfg from "../../config";
import axios, {Axios, AxiosResponse} from "axios";
import { Services } from '../index';
import ProxyService from '../proxy';

class APIService {
  
  public services: Services
  private axios: Axios
  private config: typeof cfg
  private proxy: ProxyService
  private defaultHeaders: Record<string, string>
  
  constructor(services: Services, config: typeof cfg) {
    this.services = services;
    this.proxy = this.services.proxy
    this.axios = axios.create({
      withCredentials:true
    })
    this.config = config
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  async request<T = any,D = any>({url, method = 'GET', headers = {}, agent = this.proxy.getProxyAgent(), ...options}):Promise<AxiosResponse<T,D>> {
    if (!url?.match(/^(http|\/\/)/)) url = this.config.api.baseUrl + url;

    const res = await this.axios.request({
      url,
      method,
      headers: {...this.defaultHeaders, ...headers},
      httpAgent: agent,
      httpsAgent: agent,
      ...options,
    });
    return res;
  }
}

export default APIService;
