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
          await ctx.sendMessage(
            `Cпасибо за использование нашего бота\\!` + '\n\n' +
            `*Выберите способ\:*` +`\n\n` +
            `*Обычная генерация* \\- Генерация происходит параллельно, что ускоряет процесс генерации, но меньше похоже на игру реального человека\\. Для входа в этот режим введите команду /gencodes\\.` +`\n\n` +
            `*Безопасная генерация* \\- Генерация происходит последовательно и с выдержкой перерывов между генерациями\\. Занимает больше времени, но имитирует игру реального человека\\. Для входа в этот режим введите команду /gencodessafe\\.`
          ,{parse_mode:'MarkdownV2'})
        },
        async () => {
          await ctx.sendMessage(
            `*Выберите способ\:*` +`\n\n` +
            `*Обычная генерация* \\- Генерация происходит параллельно, что ускоряет процесс генерации, но меньше похоже на игру реального человека\\. Для входа в этот режим введите команду /gencodes\\.` +`\n\n` +
            `*Безопасная генерация* \\- Генерация происходит последовательно и с выдержкой перерывов между генерациями\\. Занимает больше времени, но имитирует игру реального человека\\. Для входа в этот режим введите команду /gencodessafe\\.`
            ,{parse_mode:'MarkdownV2'})
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