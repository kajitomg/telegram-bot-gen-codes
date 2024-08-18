import TelegramBot from 'node-telegram-bot-api';
import { sleep } from '../../../helpers/sleep';
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
                await rows.map(async (row) => {
                  try {
                    await bot.sendMessage(row.chat_id, `
                      *Обновили бота*\\*!*\n\nК сожалению время генерации кодов на некоторые игры становится все больше, над этим стараются разработчики.\n\nМы пробуем решить эту проблему, следите за развитием бота в нашем канале \\- *[Хомячий Табор](https://t.me/hamtabor)*
                    `, { parse_mode: 'MarkdownV2' })
                    await sleep(1000 / 200)
                  } catch (error) {
                    console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
                  }
                })
              } catch (error) {
                console.log(error)
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