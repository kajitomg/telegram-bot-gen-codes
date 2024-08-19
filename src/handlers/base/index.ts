import { Context } from 'telegraf';
import inspectUserWrapper from '../../helpers/inspect-user-wrapper';
import { UsersSlices } from '../../slices/users';

export default {
  start: async function(ctx: Context) {
    const chatId = ctx.chat.id
    const author = ctx.from
    
    try {
      await inspectUserWrapper(
        chatId,
        author,
        async () => {
          await ctx.sendMessage(`Cпасибо за использование нашего бота\!\n\nДля генерации кодов введите команду /gencodes`)
        },
        async () => {
          await ctx.sendMessage(`Для генерации кодов введите команду /gencodes`)
        }
      )
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