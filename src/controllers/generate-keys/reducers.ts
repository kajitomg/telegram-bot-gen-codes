import { Services } from '../../services';

export default {
  login: async function(clientId, services: Services) {
    try {
      const agent = services.proxy.genProxyAgent()
      const response = await services.api.request<{clientToken: string}>({
        url: '/promo/login-client',
        method: 'POST',
        data: { appToken: process.env.APP_TOKEN, clientId, clientOrigin: 'deviceid' },
        agent,
      })
      
      return response.data.clientToken;
    } catch (error) {
      return console.log(error)
    }
  },
  
  registerEvent: async function(clientToken, services: Services) {
    try {
      const agent = services.proxy.genProxyAgent()
      const response = await services.api.request<{hasCode: boolean}>({
        url: '/promo/register-event',
        headers: {
          'Authorization': `Bearer ${clientToken}`
        },
        method: 'POST',
        data: {
          promoId: process.env.PROMO_ID,
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
  
  generateKey: async function(clientToken, services: Services) {
    try {
      const response = await services.api.request<{promoCode: string}>({
        url: '/promo/create-code',
        headers: {
          'Authorization': `Bearer ${clientToken}`
        },
        method: 'POST',
        data: { promoId: process.env.PROMO_ID },
        agent: services.proxy.genProxyAgent(),
      })
      
      return response.data.promoCode;
    } catch (error) {
      return console.log(error)
    }
  }
}