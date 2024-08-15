import { Context, Markup } from 'telegraf';
import { UsersSlices } from '../../slices/users';

const projects = [
  {id: 'hamsterkombat', name: 'Hamster Kombat', services: [{id: 'gencodes', name: 'Генерация кодов'}]},
  {id: 'tapswap', name: 'TapSwap', services: [{id: 'getcodes', name: 'Получение кодов'}]}
]

export default {
  selectProject: async function(ctx: Context) {
    const chatId = ctx.chat.id
    const author = ctx.from
    
    try {
      await UsersSlices.getUserByChatId(
        chatId,
        {
          successCallback: async (row) => {
            if (!row) {
              await UsersSlices.createUser(
                { userId: author.username, chatId, username: author.first_name })
            }
          }
        })
      
      const markup = Markup.inlineKeyboard(
        projects.map((project) => Markup.button.callback(project.name, `select::project::${project.id}`)),
        { columns: 2 },
      )
      
      await ctx.sendMessage('Выберите проект:', markup);
    } catch (error) {
      console.log(author.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
    }
  },
  
  getProjectServices: async function(ctx: Context) {
    const chatId = ctx.chat.id
    const author = ctx.from
    // @ts-ignore
    const data = await ctx.update.callback_query.data.split('::')
    const selectedProject = data[data.length - 1]
    
    try {
      await UsersSlices.getUserByChatId(
        chatId,
        {
          successCallback: async (row) => {
            if (!row) {
              await UsersSlices.createUser(
                { userId: author.username, chatId, username: author.first_name })
            }
          }
        })
      
      const markup = Markup.inlineKeyboard(
        projects.find((project => project.id === selectedProject)).services.map((service) => Markup.button.callback(service.name, `select::project::service::${service.id}`)),
        { columns: 2 },
      )
      
      await ctx.sendMessage('Выберите услугу:', markup);
    } catch (error) {
      console.log(author.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
    }
  }
}