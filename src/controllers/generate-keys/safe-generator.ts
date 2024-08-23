require('dotenv').config()
import axios, { Axios, CancelTokenSource } from 'axios';
import { Context, Markup } from 'telegraf';
import { generateClientId } from '../../helpers/generate-client-id';
import { getRandomDelay } from '../../helpers/get-random-delay';
import { sleep } from '../../helpers/sleep';
import { services } from '../../index';
import generateKeysReducers from './reducers'
import { Games, games } from '../../models/game';
import ua from 'user-agents';

export default async function generateKeysSafe (keyCount:number = 1, ctx:Context,chatId, messageId, progress:number, username:string, gameId: Games, abort:AbortController, edit:boolean = true): Promise<Awaited<string | void>[]> {
  const game = games.find((game) => game.id === gameId)
  const EVENTS_DELAY = game.delay
  const PENDING_AMOUNT_ITERATIONS = game.iterations
  
  console.log(`generation for ${username} has been started ` + new Date())
  
  async function generateKeyProcess() {
    let keys = []

    for (let i:number = 0; i < keyCount; i++ ) {
      try {
        if(abort.signal.aborted) break
        const proxy = services.proxy.genProxyAgent()
        const iosUserAgent = ua.random({ platform: 'iPhone' });
        const clientId = generateClientId();
        keys = [...keys, await genKey(clientId,iosUserAgent,proxy)]
        // await sleep(300000 * getRandomDelay());
      } catch (e) {
        console.log(e)
      }
    }
    
    return keys
  }
  
  const genKey = async (clientId, agent, proxy) => {
    if(abort.signal.aborted) return
    let clientToken
    
    try {
      clientToken = await generateKeysReducers.login(clientId, game.app_token, proxy, agent, abort,services);
    } catch (error) {
      console.log(`Ошибка при авторизации для ${username}`)
      return null;
    }
    
    for (let i: number = 0; i < (PENDING_AMOUNT_ITERATIONS * 2); i++) {
      if(abort.signal.aborted) break
      try {
        await sleep((EVENTS_DELAY) * getRandomDelay());
        progress += 100 / (PENDING_AMOUNT_ITERATIONS * keyCount)
        const markup = Markup.inlineKeyboard(
          [0].map(() => Markup.button.callback('Остановить генерацию', `select::generate::stop`)),
          { columns: 2},
        )
        edit && await ctx.telegram.editMessageText(chatId,messageId, undefined,`Идет генерация кодов... ${Math.round(progress >= 100 ? 100 : progress)}%`,markup )
        
        const hasCode = await generateKeysReducers.registerEvent(clientToken, game.promo_id, proxy, agent, abort, services);
        
        if (hasCode) {
          break;
        }
      } catch (error) {
        console.log(username + ' ' + error.response?.error_code + ' ' + error.response?.description)
        return null;
      }
    }
    try {
      if(abort.signal.aborted) return
      const key = await generateKeysReducers.generateKey(clientToken, game.promo_id, proxy, agent, abort, services);
      console.log(key)
      
      return key;
    } catch (error) {
      console.log(`Ошибка при генерации ключа для ${username}`)
      return null;
    }
  }
  
  
  const keys = await generateKeyProcess();
  console.log(`generation for ${username} has been finish ` + new Date())
  return keys
};