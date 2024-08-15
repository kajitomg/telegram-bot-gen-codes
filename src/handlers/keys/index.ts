import { Context, Markup } from 'telegraf';
import generateKeys from '../../controllers/generate-keys';
import { games } from '../../index';
import { UsersSlices } from '../../slices/users';

const pendingRequests = {};

export default {
  generate: async function (ctx: Context) {
    const chatId = ctx.chat.id
    const author = ctx.from
    // @ts-ignore
    const data = await ctx.callbackQuery.data.split('::')
    const selectedCount = data[data.length - 1]
    
    try {
      if ( pendingRequests[chatId]?.pending ) {
        return await ctx.sendMessage(`У вас уже есть 1 активный запрос, дождитесь его окончания!`)
      }
      const progress = 0
      await ctx.deleteMessage()
      
      const message = await ctx.sendMessage(`Идет генерация кодов... ${progress}%`);
      
      pendingRequests[chatId].pending = true
      console.log(pendingRequests[chatId].variant)
      let keys = []
      let codes = ''
      if( pendingRequests[chatId].variant === 'all' ) {
        keys = await Promise.all(Array.from({ length: +selectedCount }, async (empty, i) => {
          //@ts-ignore
          const keys = await generateKeys(+selectedCount,  ctx,chatId, message.message_id,  progress, msg.chat.username, games[i].id, i === 0)
          
          return `*${games[i].name}*` + '\n\n`' + keys.filter(key => key).join('`\n\n`')?.toString() + '`'
        }));
        codes = '\n\n' + keys.filter(key => key).join('\n\n')?.toString()  + '\n\n'
      } else {
        keys = await generateKeys(+selectedCount,  ctx,chatId, message.message_id, progress, author.username, pendingRequests[chatId].variant)
        codes = '\n\n`' + keys.filter(key => key).join('`\n\n`')?.toString() + '`\n\n'
      }
      delete pendingRequests[chatId]
      await ctx.telegram.deleteMessage(chatId, message.message_id)
      await ctx.sendMessage(
        '*Коды успешно сгенерированы \\(нажмите на код, чтобы скопировать\\)\\:*' +
        `${codes}` +
        '*Подписывайся на наш канал \\- [Хомячий Табор](https://t.me/+lZLomxu29j81NGQy)*',
        {parse_mode: 'MarkdownV2'})
      
    } catch (error) {
      console.log(author.username + ' ' + error.response?.error_code + ' ' + error.response?.description)
    }
  },
  
  selectGenerateGame: async function (ctx: Context) {
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
        games.map((game, i) => Markup.button.callback(game.name, `select::generate::game::${game.id}`)),
        { columns: 2 },
      )
      
      await ctx.sendMessage('Выберите игру:', markup);
    } catch (error) {
      console.log(author.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
    }
  },
  
  selectGenerateCount: async function (ctx: Context) {
    const chatId = ctx.chat.id
    const author = ctx.from
    // @ts-ignore
    const data = await ctx.update.callback_query.data.split('::')
    const selectedGame = data[data.length - 1]
    
    try {
      
      const variant = games.find((game) => game.id === selectedGame)
      
      if(!pendingRequests[chatId]) {
        pendingRequests[chatId] = {}
      }
      pendingRequests[chatId].variant = variant.id
      
      await ctx.deleteMessage()
      
      await ctx.sendMessage(`*Вы выбрали ${variant.name}*`,{parse_mode: 'MarkdownV2'});
      
      const markup = Markup.inlineKeyboard(
        ['1','2','3','4'].map((count, i) => Markup.button.callback(count, `select::generate::count::${count}`)),
        { columns: 2},
      )
      
      await ctx.sendMessage(`Выберите количество генерируемых кодов:`, markup);
    } catch (error) {
      console.log(author.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
    }
  }
}