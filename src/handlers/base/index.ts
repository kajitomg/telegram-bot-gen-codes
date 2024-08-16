import { Context } from 'telegraf';
import { UsersSlices } from '../../slices/users';

export default {
  start: async function(ctx: Context) {
    const chatId = ctx.chat.id
    const author = ctx.from
    
    try {
      await UsersSlices.getUserByChatId(
        chatId,
        {
          successCallback: async (row) => {
            if (row.length === 0) {
              await UsersSlices.createUser(
                { userId: author.username, chatId, username: author.first_name },
                {
                  successCallback: async () => {
                    await ctx.sendMessage(`Cпасибо за использование нашего бота\!\n\nДля генерации кодов введите команду /gencodes`)
                  }
                })
            } else {
              await ctx.sendMessage(`Для генерации кодов введите команду /gencodes`)
            }
          }
        })
    } catch (error) {
      console.log(author.username + ' ' + error.response?.error_code + ' ' + error.response?.description)
    }
  },
  default: async function(ctx: Context) {
    const author = ctx.from
    
    try {
      await ctx.sendMessage('Неизвестная команда, для генерации кодов введите команду /gencodes')
    } catch (error) {
      console.log(author.username + ' ' + error.response?.error_code + ' ' + error.response?.description)
    }
  }
}