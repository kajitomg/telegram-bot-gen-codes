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
            if (!row) {
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
      console.log(author.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
    }
  }
}