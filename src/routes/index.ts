import TelegramBot from 'node-telegram-bot-api';
import { callbackQueryCodesRoutes } from './codes/callback-query';
import { textCodesRoutes } from './codes/text';
import { textDefaultRoutes } from './default/text';

export const textRoutes = (bot) => async (msg) => {
  const defaultRoutes = await textDefaultRoutes(msg, bot)
  const codesRoutes = await textCodesRoutes(msg, bot)
    
  switch (msg.text) {
    case '/postsecure': {
      await defaultRoutes.startpostnewssecure()
      break;
    }
  }
}

export const callbackQueryRoutes = (bot) => async (callbackQuery:TelegramBot.CallbackQuery) => {

}