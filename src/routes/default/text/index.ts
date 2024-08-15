import TelegramBot from 'node-telegram-bot-api';
import db from '../../../services/database';
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
              if (row.length === 0) {
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
    startpostnewssecure: async () => {
      try {
        if(chatId === 806145885) {
          await db.userDB.readDistinctUsers(async (err, rows) => {
            if (err) {
              console.log(err);
              console.log('Произошла ошибка при поиске пользователя');
            } else {
              try {
                rows.map((row) => {
                  try {
                    const message = bot.sendMessage(row.chat_id, `
              Обновление бота\\!\n\n*[Подробности можете узнать в нашем канале](https://t.me/hamtabor/356)*
            `, { parse_mode: 'MarkdownV2' })
                  } catch (error) {
                    console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
                  }
                })
              } catch (e) {
                console.log(e)
              }
            }
          })
        }
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