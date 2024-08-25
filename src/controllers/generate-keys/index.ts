require('dotenv').config()
import { Context } from 'telegraf';
import { generateClientId } from '../../helpers/generate-client-id';
import { getRandomDelay } from '../../helpers/get-random-delay';
import { sleep } from '../../helpers/sleep';
import { services } from '../../index';
import generateKeysReducers from './reducers'
import { Games, games } from '../../models/game';
import ua from 'user-agents';

export default async function generateKeys (keyCount:number = 1, ctx:Context,chatId, messageId, progress:number, username:string, gameId: Games, abort:AbortController, edit:boolean = true): Promise<Awaited<string | void>[]> {
  const game = games.find((game) => game.id === gameId)
  const EVENTS_DELAY = game.delay
  const PENDING_AMOUNT_ITERATIONS = game.iterations
  const androidUserAgent = ua.random({ platform: 'Android' });
  
  async function generateKeyProcess() {
    const proxy = services.proxy.genProxyAgent();
    const clientId = generateClientId();
    
    let clientToken
    
    try {
      abort.signal.throwIfAborted()
      clientToken = await generateKeysReducers.login({
        clientId,
        appToken: game.app_token
      },services, {
        proxy,
        agent: androidUserAgent,
        abort
      });
    } catch (error) {
      console.log(`Ошибка при авторизации для ${username}`)
      return null;
    }
    
    for (let i: number = 0; i < (PENDING_AMOUNT_ITERATIONS * 2); i++) {
      abort.signal.throwIfAborted()
      try {
        await sleep(+EVENTS_DELAY * getRandomDelay(),{signal: abort.signal});
        progress += (100 / PENDING_AMOUNT_ITERATIONS) / keyCount
        
        edit && await ctx.telegram.editMessageText(chatId,messageId, undefined,`Идет генерация кодов... ${Math.round(progress >= 100 ? 100 : progress)}%`)

        const hasCode = await generateKeysReducers.registerEvent({
          clientToken,
          promoId: game.promo_id
        },services, {
          proxy,
          agent: androidUserAgent,
          abort
        });
        
        if (hasCode) {
          break;
        }
      } catch (error) {
        console.log(username + ' ' + error.response?.error_code + ' ' + error.response?.description)
        return null;
      }
    }
    
    try {
      abort.signal.throwIfAborted()
      const key = await generateKeysReducers.generateKey({
        clientToken,
        promoId: game.promo_id
      },services, {
        proxy,
        agent: androidUserAgent,
        abort
      });
      return key;
    } catch (error) {
      console.log(`Ошибка при генерации ключа для ${username}`)
      return null;
    }
  }
  
  
  const keys = await Promise.all(Array.from({ length: keyCount }, generateKeyProcess));
  return keys
};