require('dotenv').config()
import { Context } from 'telegraf';
import { generateClientId } from '../../helpers/generate-client-id';
import { getRandomDelay } from '../../helpers/get-random-delay';
import { sleep } from '../../helpers/sleep';
import { services } from '../../index';
import generateKeysReducers from './reducers'
import { Games, games } from '../../models/game';

export default async function generateKeys (keyCount:number = 1, ctx:Context,chatId, messageId, progress:number, username:string, gameId: Games, edit:boolean = true): Promise<Awaited<string | void>[]> {
  const game = games.find((game) => game.id === gameId)
  const EVENTS_DELAY = game.delay
  
  const PENDING_AMOUNT_ITERATIONS = game.iterations
  
  console.log(`generation for ${username} has been started ` + new Date())
  
  async function generateKeyProcess() {
    const clientId = generateClientId();
    
    let clientToken
    
    try {
      clientToken = await generateKeysReducers.login(clientId, game.app_token, services);
    } catch (error) {
      console.log(`Ошибка при авторизации для ${username}`)
      return null;
    }
    
    for (let i: number = 0; i < PENDING_AMOUNT_ITERATIONS * 2; i++) {
      try {
        await sleep(+EVENTS_DELAY * getRandomDelay());
        progress += (100 / (PENDING_AMOUNT_ITERATIONS)) / keyCount
        progress = progress >= 100 ? 100 : progress
        
        edit && await ctx.telegram.editMessageText(chatId,messageId, undefined,`Идет генерация кодов... ${Math.round(progress)}%`)
  
        const hasCode = await generateKeysReducers.registerEvent(clientToken, game.promo_id, services);
        if (hasCode) {
          break;
        }
      } catch (error) {
        console.log(username + ' ' + error.response?.error_code + ' ' + error.response?.description)
        return null;
      }
    }
    
    try {
      const key = await generateKeysReducers.generateKey(clientToken, game.promo_id, services);
      return key;
    } catch (error) {
      console.log(`Ошибка при генерации ключа для ${username}`)
      return null;
    }
  }
  
  
  const keys = await Promise.all(Array.from({ length: keyCount }, generateKeyProcess));
  console.log(`generation for ${username} has been finish ` + new Date())
  return keys
};