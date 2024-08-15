import { Services } from '../../services';
import { games } from './index';

export default {
  login: async function(clientId, game:'bike'|'cube'|'clone'|'miner'|'merge', services: Services) {
    try {
      const agent = services.proxy.genProxyAgent()
      const response = await services.api.request<{clientToken: string}>({
        url: '/promo/login-client',
        method: 'POST',
        data: { appToken: games[game].appToken, clientId, clientOrigin: 'deviceid' },
        agent,
      })
      
      return response.data.clientToken;
    } catch (error) {
      return console.log(error)
    }
  },
  
  registerEvent: async function(clientToken, game:'bike'|'cube'|'clone'|'miner'|'merge', services: Services) {
    try {
      const agent = services.proxy.genProxyAgent()
      const response = await services.api.request<{hasCode: boolean}>({
        url: '/promo/register-event',
        headers: {
          'Authorization': `Bearer ${clientToken}`
        },
        method: 'POST',
        data: {
          promoId: games[game].promoId,
          eventId: crypto.randomUUID(),
          eventOrigin: 'undefined'
        },
        agent,
      })
      
      return response.data.hasCode;
    } catch (error) {
      return console.log(error)
    }
  },
  
  generateKey: async function(clientToken, game:'bike'|'cube'|'clone'|'miner'|'merge', services: Services) {
    try {
      const response = await services.api.request<{promoCode: string}>({
        url: '/promo/create-code',
        headers: {
          'Authorization': `Bearer ${clientToken}`
        },
        method: 'POST',
        data: { promoId: games[game].promoId },
        agent: services.proxy.genProxyAgent(),
      })
      
      return response.data.promoCode;
    } catch (error) {
      return console.log(error)
    }
  }
}