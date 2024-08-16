require('dotenv').config()
import { generateClientId } from '../../helpers/generate-client-id';
import { getRandomDelay } from '../../helpers/get-random-delay';
import { sleep } from '../../helpers/sleep';
import { services } from '../../index';
import generateKeysReducers from './reducers'

export const games= {
  bike:{ name: "bike", appToken: process.env.APP_TOKEN_BIKE, promoId: process.env.PROMO_ID_BIKE, delay:process.env.EVENTS_DELAY_BIKE,maxAmount:process.env.MAX_AMOUNT_ITTERATIONS_BIKE,pendingAmount:process.env.PENDING_AMOUNT_ITTERATIONS_BIKE },
  cube:{ name: "cube", appToken: process.env.APP_TOKEN_CUBE, promoId: process.env.PROMO_ID_CUBE, delay:process.env.EVENTS_DELAY_CUBE,maxAmount:process.env.MAX_AMOUNT_ITTERATIONS_CUBE,pendingAmount:process.env.PENDING_AMOUNT_ITTERATIONS_CUBE },
  clone:{ name: "clone", appToken: process.env.APP_TOKEN_CLONE, promoId: process.env.PROMO_ID_CLONE, delay:process.env.EVENTS_DELAY_CLONE,maxAmount:process.env.MAX_AMOUNT_ITTERATIONS_CLONE,pendingAmount:process.env.PENDING_AMOUNT_ITTERATIONS_CLONE },
  miner:{ name: "miner", appToken: process.env.APP_TOKEN_MINER, promoId: process.env.PROMO_ID_MINER, delay:process.env.EVENTS_DELAY_MINER,maxAmount:process.env.MAX_AMOUNT_ITTERATIONS_MINER,pendingAmount:process.env.PENDING_AMOUNT_ITTERATIONS_MINER },
  merge:{ name: "merge", appToken: process.env.APP_TOKEN_MERGE, promoId: process.env.PROMO_ID_MERGE, delay:process.env.EVENTS_DELAY_MERGE,maxAmount:process.env.MAX_AMOUNT_ITTERATIONS_MERGE,pendingAmount:process.env.PENDING_AMOUNT_ITTERATIONS_MERGE },
  twerk:{ name: "twerk", appToken: process.env.APP_TOKEN_TWERK, promoId: process.env.PROMO_ID_TWERK, delay:process.env.EVENTS_DELAY_TWERK,maxAmount:process.env.MAX_AMOUNT_ITTERATIONS_TWERK,pendingAmount:process.env.PENDING_AMOUNT_ITTERATIONS_TWERK }
  
}

export default async function generateKeys (keyCount:number = 1, bot, chatId:number, messageId:number, progress:number, username:string, game:'bike'|'cube'|'clone'|'miner'|'merge'|'twerk', edit:boolean = true): Promise<Awaited<string | void>[]> {
  const EVENTS_DELAY = games[game].delay
  
  const MAX_AMOUNT_ITTERATIONS = games[game].maxAmount
  const PENDING_AMOUNT_ITTERATIONS = games[game].pendingAmount
  
  console.log(`generation for ${username} has been started ` + new Date())
  
  async function generateKeyProcess() {
    const clientId = generateClientId();
    
    let clientToken
    
    try {
      clientToken = await generateKeysReducers.login(clientId, game, services);
    } catch (error) {
      console.log(`Ошибка при авторизации для ${username}`)
      return null;
    }
    
    for (let i: number = 0; i < +MAX_AMOUNT_ITTERATIONS - 1; i++) {
      try {
        await sleep(+EVENTS_DELAY * getRandomDelay());
        progress += progress >= 100 ? 100 : (100 / (+PENDING_AMOUNT_ITTERATIONS + 1)) / keyCount
        
        edit && await bot.editMessageText(`Идет генерация кодов... ${Math.round(progress)}%`,{chat_id:chatId,message_id:messageId})
      } catch (error) {
        console.log(username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
      }
      
      try {
        const hasCode = await generateKeysReducers.registerEvent(clientToken, game, services);
        
        if (hasCode) {
          break;
        }
      } catch (error) {
        console.log(`Ошибка при регистрации события для ${username}`)
        return null;
      }
    }
    
    try {
      const key = await generateKeysReducers.generateKey(clientToken, game, services);
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