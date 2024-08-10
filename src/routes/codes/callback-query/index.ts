import TelegramBot from 'node-telegram-bot-api';
import generateKeys from '../../../controllers/generate-keys';
import { bot, games } from '../../../index';
import db from '../../../services/database';

const pendingRequests = {};

export const callbackQueryCodesRoutes = async (callbackQuery:TelegramBot.CallbackQuery, bot: TelegramBot) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id
  
  const { data = "" } = callbackQuery;
  
  return {
    setGame: async () => {
      try {
        const variant = games[data]
        await bot.sendMessage(chatId, `*Вы выбрали ${variant.name}*`,{ parse_mode: 'MarkdownV2'})
        if(!pendingRequests[chatId]) {
          pendingRequests[chatId] = {}
        }
        pendingRequests[chatId].variant = variant.id
        await bot.sendMessage(chatId, `Выберите количество генерируемых кодов:`,{
          reply_markup: {
            inline_keyboard: [
              [{text: '1', callback_data: '1'},{text: '2', callback_data: '2'}],
              [{text: '3', callback_data: '3'},{text: '4', callback_data: '4'}],
            ],
          },
        })
      } catch (error) {
        console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
      }
    },
    setGenCount: async () => {
      try {
        if ( pendingRequests[chatId]?.pending ) {
          return await bot.sendMessage(chatId, `У вас уже есть 1 активный запрос, дождитесь его окончания!`,{})
        }
        const progress = 0
        const message = await bot.sendMessage(chatId, `Идет генерация кодов... ${progress}%`,{})
        pendingRequests[chatId].pending = true
        console.log(pendingRequests[chatId].variant)
        const keys = await generateKeys(+data,  bot, chatId, message.message_id, progress, msg.chat.username, pendingRequests[chatId].variant)
        delete pendingRequests[chatId]
        await bot.deleteMessage(chatId,message.message_id)
        await bot.sendMessage(chatId,
          '*Коды успешно сгенерированы \\(нажмите на код, чтобы скопировать\\)\\:*' +
          '\n\n`' +
          `${keys.filter(key => key).join('`\n\n`')?.toString()}` +
          '`\n\n' +
          '*Подписывайся на наш канал \\- [Хомячий Табор](https://t.me/+lZLomxu29j81NGQy)*',
          { parse_mode: 'MarkdownV2'}
        )
        
      } catch (error) {
        console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
      }
    },
  }
}