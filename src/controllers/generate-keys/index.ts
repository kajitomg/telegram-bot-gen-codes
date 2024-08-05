import { generateClientId } from '../../helpers/generate-client-id';
import { getRandomDelay } from '../../helpers/get-random-delay';
import { sleep } from '../../helpers/sleep';
import { services } from '../../index';
import generateKeysReducers from './reducers'

const EVENTS_DELAY = 20000

const MAX_AMOUNT_ITTERATIONS = 8
const PENDING_AMOUNT_ITTERATIONS = 4

export default async function generateKeys (keyCount:number = 1, bot, chatId:number, messageId:number, progress:number, username:string): Promise<Awaited<string | void>[]> {
  console.log(`generation for ${username} has been started ` + new Date())
  
  async function generateKeyProcess() {
    const clientId = generateClientId();
    
    let clientToken
    
    try {
      clientToken = await generateKeysReducers.login(clientId, services);
    } catch (error) {
      console.log(`Ошибка при авторизации для ${username}`)
      return null;
    }
    
    for (let i: number = 0; i < MAX_AMOUNT_ITTERATIONS - 1; i++) {
      try {
        
        await sleep(EVENTS_DELAY * getRandomDelay());
        progress += progress >= 100 ? 100 : (100 / (PENDING_AMOUNT_ITTERATIONS + 1)) / keyCount
        
        await bot.editMessageText(`Идет генерация кодов... ${progress}%`,{chat_id:chatId,message_id:messageId})
      } catch (error) {
        console.log(username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
      }
      
      try {
        const hasCode = await generateKeysReducers.registerEvent(clientToken, services);
        
        if (hasCode) {
          break;
        }
      } catch (error) {
        console.log(`Ошибка при регистрации события для ${username}`)
        return null;
      }
    }
    
    try {
      const key = await generateKeysReducers.generateKey(clientToken, services);
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