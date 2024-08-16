import { Context, Markup } from 'telegraf';
import generateKeys from '../../controllers/generate-keys';
import { games } from '../../index';
import { UsersSlices } from '../../slices/users';

export default {
  
  selectGenerateGame: async function (ctx: Context) {
    const chatId = ctx.chat.id
    const author = ctx.from
    
    try {
      
      const markup = Markup.inlineKeyboard(
        games.map((game, i) => Markup.button.callback(game.name, `select::generate::game::${game.id}`)),
        { columns: 2 },
      )
      
      await ctx.sendMessage('Выберите игру:', markup);
    } catch (error) {
      console.log(author.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
    }
  },
  
}