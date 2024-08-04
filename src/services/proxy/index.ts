require('dotenv').config()
import { getRandomNumber } from '../../helpers/get-random-number';
import { Services } from '../index';
const HttpProxyAgent = require('https-proxy-agent');

const proxys = [
  '45.89.19.15:11644',
  '45.89.18.244:16126',
  '45.89.19.25:12838',
  '45.89.19.32:7766',
  '45.89.18.249:12476',
  '45.89.19.76:16820',
  '45.89.18.247:5936',
  '45.89.19.13:17800',
  '45.89.19.53:9324',
  '45.89.18.247:5926',
]

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
