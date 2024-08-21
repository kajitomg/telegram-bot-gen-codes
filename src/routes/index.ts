import TelegramBot from 'node-telegram-bot-api';
import { callbackQueryCodesRoutes } from './codes/callback-query';
import { textCodesRoutes } from './codes/text';
import { textDefaultRoutes } from './default/text';

export const textRoutes = (bot) => async (msg) => {
  const defaultRoutes = await textDefaultRoutes(msg, bot)
  const codesRoutes = await textCodesRoutes(msg, bot)
  
  switch (msg.text) {
    case '/start': {
      await defaultRoutes.start()
      break;
    }
    case '/gencodes': {
      await codesRoutes.gencodes()
      break;
    }
    case '/startpostnewssecure': {
      await defaultRoutes.startpostnewssecure()
      break;
    }
    default: {
      await defaultRoutes.default()
    }
  }
}

export const callbackQueryRoutes = (bot) => async (callbackQuery:TelegramBot.CallbackQuery) => {
  const msg = callbackQuery.message;
  const codesRoutes = await callbackQueryCodesRoutes(callbackQuery, bot);
  const chatId = msg.chat.id
  
  try {
    await bot.deleteMessage(chatId,msg.message_id)
    
    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.log(error)
    console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
  }
  
  switch (msg.text) {
    case 'Выберите игру:': {
      await codesRoutes.setGenCount()
      break;
    }
    case 'Выберите количество генерируемых кодов:': {
      await codesRoutes.generateCodes()
      break;
    }
  }
}