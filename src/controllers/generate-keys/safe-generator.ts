require('dotenv').config()
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
  
  async function generateKeyProcess() {
    let keys = []

    for (let i:number = 0; i < keyCount; i++ ) {
      try {
        const proxy = services.proxy.genProxyAgent()
        const iosUserAgent = ua.random({ platform: 'iPhone' });
        const clientId = generateClientId();
        await sleep(300000 * getRandomDelay(),{signal: abort.signal});
        keys = [...keys, await genKey(clientId,iosUserAgent,proxy)]
      } catch (e) {
        console.log(e)
      }
    }
    
    return keys
  }
  
  const genKey = async (clientId, agent, proxy) => {
    abort.signal.throwIfAborted()
    let clientToken
    
    try {
      clientToken = await generateKeysReducers.login({
        clientId,
        appToken: game.app_token
      },services, {
        proxy,
        agent,
        abort
      });
    } catch (error) {
      console.log(`Ошибка при авторизации для ${username}`)
      return null;
    }
    
    for (let i: number = 0; i < (PENDING_AMOUNT_ITERATIONS * 2); i++) {
      abort.signal.throwIfAborted()
      try {
        await sleep((EVENTS_DELAY + 60000) * getRandomDelay(),{signal: abort.signal});
        progress += 100 / (PENDING_AMOUNT_ITERATIONS * keyCount)
        const markup = Markup.inlineKeyboard(
          [0].map(() => Markup.button.callback('Остановить генерацию', `select::generate::stop`)),
          { columns: 2},
        )
        edit && await ctx.telegram.editMessageText(chatId,messageId, undefined,`Идет генерация кодов\\.\\.\\. ${Math.round(progress >= 100 ? 100 : progress)}%` + '\n' + '_\\(может занять много времени\\)_', { reply_markup: markup.reply_markup, parse_mode:'MarkdownV2' } )
        
        const hasCode = await generateKeysReducers.registerEvent({
          clientToken,
          promoId: game.promo_id
        },services, {
          proxy,
          agent,
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
        agent,
        abort
      });
      
      return key;
    } catch (error) {
      console.log(`Ошибка при генерации ключа для ${username}`)
      return null;
    }
  }
  
  
  const keys = await generateKeyProcess();
  return keys
};