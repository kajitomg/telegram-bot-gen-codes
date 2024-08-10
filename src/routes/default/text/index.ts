import TelegramBot from 'node-telegram-bot-api';
import { UsersSlices } from '../../../slices/users';

export const textDefaultRoutes = async (msg:TelegramBot.Message, bot: TelegramBot) => {
  const chatId = msg.chat.id
  
  return {
    start: async () => {
      try {
        await UsersSlices.getUserByChatId(
          chatId,
          {
            successCallback: async (row) => {
              if (!row) {
                await UsersSlices.createUser(
                  { userId: msg.chat.username, chatId, username: msg.chat.first_name },
                  {
                    successCallback: async () => {
                      await bot.sendMessage(chatId, `Cпасибо за использование нашего бота\\!\n\nДля генерации кодов введите команду /gencodes`, { parse_mode: 'MarkdownV2' })
                    }
                  })
              } else {
                await bot.sendMessage(chatId, `Для генерации кодов введите команду /gencodes`, { parse_mode: 'MarkdownV2' })
              }
            }
          })
      } catch (error) {
        console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
      }
    },
    default: async () => {
      try {
        await bot.sendMessage(chatId, 'Неизвестная команда, для генерации кодов введите команду /gencodes',{})
      } catch (error) {
        console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
      }
    }
  }
}