import cfg from '../config'
import APIService from './api';
import ProxyService from './proxy';

export class Services {
  config:typeof cfg
  private _api?:APIService
  private _proxy?:ProxyService
  
  constructor(config:typeof cfg) {
    this.config = config
  }
  
  get api() {
    if (!this._api) {
      this._api = new APIService(this, this.config);
    }
    return this._api;
  }
  
  get proxy() {
    if (!this._proxy) {
      this._proxy = new ProxyService();
    }
    return this._proxy;
  }
  
}

export default new Services(cfg)