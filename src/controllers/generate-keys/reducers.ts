import { HttpsProxyAgent } from 'https-proxy-agent';
import { Services } from '../../services';

export default {
  login: async function(data: {clientId: string, appToken: string}, services: Services, options?: {proxy?:HttpsProxyAgent<string>, agent?:number, abort?:AbortController}) {
    try {
      const response = await services.api.request<{clientToken: string}>({
        url: '/promo/login-client',
        headers: {
          'User-Agent': options.agent,
        },
        method: 'POST',
        data: { clientId:data.clientId, appToken:data.appToken, clientOrigin: 'deviceid' },
        ...(options.proxy ? {agent: options.proxy}: {}),
        ...(options.abort ? {signal: options.abort.signal}: {}),
      })
      
      return response.data.clientToken;
    } catch (error) {
      return console.log(error)
    }
  },
  
  registerEvent: async function(data: {clientToken: string, promoId:string}, services: Services, options?: {proxy?:HttpsProxyAgent<string>, agent?:number, abort?:AbortController}) {
    try {
      const response = await services.api.request<{hasCode: boolean}>({
        url: '/promo/register-event',
        headers: {
          'Authorization': `Bearer ${data.clientToken}`,
          'User-Agent': options.agent,
        },
        method: 'POST',
        data: {
          promoId:data.promoId,
          eventId: crypto.randomUUID(),
          eventOrigin: 'undefined'
        },
        ...(options.proxy ? {agent: options.proxy}: {}),
        ...(options.abort ? {signal: options.abort.signal}: {}),
      })
      
      return response.data.hasCode;
    } catch (error) {
      return console.log(error)
    }
  },
  
  generateKey: async function(data: {clientToken: string, promoId:string}, services: Services, options?: {proxy?:HttpsProxyAgent<string>, agent?:number, abort?:AbortController}) {
    try {
      const response = await services.api.request<{promoCode: string}>({
        url: '/promo/create-code',
        headers: {
          'Authorization': `Bearer ${data.clientToken}`,
          'User-Agent': options.agent,
        },
        method: 'POST',
        data: { promoId: data.promoId},
        ...(options.proxy ? {agent: options.proxy}: {}),
        ...(options.abort ? {signal: options.abort.signal}: {}),
      })
      
      return response.data.promoCode;
    } catch (error) {
      return console.log(error)
    }
  }
}