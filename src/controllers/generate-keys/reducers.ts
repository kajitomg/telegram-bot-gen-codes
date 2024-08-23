import axios, { CancelTokenSource } from 'axios';
import { Services } from '../../services';

export default {
  login: async function(clientId, appToken: string, proxy, agent, abort?:AbortController, services?: Services) {
    try {
      const response = await services.api.request<{clientToken: string}>({
        url: '/promo/login-client',
        headers: {
          'User-Agent': agent,
        },
        method: 'POST',
        data: { appToken, clientId, clientOrigin: 'deviceid' },
        agent: proxy,
      })
      
      return response.data.clientToken;
    } catch (error) {
      return console.log(error)
    }
  },
  
  registerEvent: async function(clientToken, promoId:string, proxy, agent, abort?:AbortController, services?: Services) {
    try {
      const response = await services.api.request<{hasCode: boolean}>({
        url: '/promo/register-event',
        headers: {
          'Authorization': `Bearer ${clientToken}`,
          'User-Agent': agent,
        },
        method: 'POST',
        data: {
          promoId,
          eventId: crypto.randomUUID(),
          eventOrigin: 'undefined'
        },
        agent: proxy,
      })
      
      return response.data.hasCode;
    } catch (error) {
      return console.log(error)
    }
  },
  
  generateKey: async function(clientToken, promoId: string, proxy, agent, abort?:AbortController, services?: Services) {
    try {
      const response = await services.api.request<{promoCode: string}>({
        url: '/promo/create-code',
        headers: {
          'Authorization': `Bearer ${clientToken}`,
          'User-Agent': agent,
        },
        method: 'POST',
        data: { promoId },
        agent: proxy,
      })
      
      return response.data.promoCode;
    } catch (error) {
      return console.log(error)
    }
  }
}