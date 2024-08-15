import TelegramBot from 'node-telegram-bot-api';
import { games } from '../../../index';
import { UsersSlices } from '../../../slices/users';

export const textCodesRoutes = async (msg:TelegramBot.Message, bot: TelegramBot) => {
  const chatId = msg.chat.id
  
  return {
    gencodes: async () => {
      try {
        await UsersSlices.getUserByChatId(
          chatId,
          {
            successCallback: async (row) => {
              if (row.length === 0) {
                await UsersSlices.createUser(
                  { userId: msg.chat.username, chatId, username: msg.chat.first_name })
              }
            }
          })
        await bot.sendMessage(chatId, `Выберите игру:`,{
          reply_markup: {
            inline_keyboard: [
              [{text: games[0].name, callback_data: '0'},{text: games[1].name, callback_data: '1'}],
              [{text: games[2].name, callback_data: '2'},{text: games[3].name, callback_data: '3'}],
              [{text: games[4].name, callback_data: '4'}],
              [{text: games[5].name, callback_data: '5'}],
            ],
          },
        })
      } catch (error) {
        console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
      }
    },
  }
}