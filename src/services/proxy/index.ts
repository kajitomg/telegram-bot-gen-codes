require('dotenv').config()
import { getRandomNumber } from '../../helpers/get-random-number';
import { Services } from '../index';
const HttpProxyAgent = require('https-proxy-agent');

import * as data from './servers.json';

const proxys = data?.proxys

class ProxyService {
  
  public services: Services
  private proxyAgent
  constructor() {
    this.setProxyAgent(this.genProxyAgent())
  }
  
  genProxyAgent(proxy = proxys[getRandomNumber(1, proxys.length) - 1], username = process.env.PROXY_USERNAME, password = process.env.PROXY_PASSWORD) {
    return new HttpProxyAgent.HttpsProxyAgent(`http://${username}:${password}@${proxy}`);
  }
  
  getProxyAgent() {
    return this.proxyAgent;
  }
  
  setProxyAgent(proxyAgent) {
    this.proxyAgent = proxyAgent;
  }
}

export default ProxyService;
