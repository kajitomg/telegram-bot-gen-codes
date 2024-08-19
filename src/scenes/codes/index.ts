import { Markup } from 'telegraf';
import { BaseScene } from 'telegraf/scenes';
import generateKeys from '../../controllers/generate-keys';
import inspectUserWrapper from '../../helpers/inspect-user-wrapper';
import send from '../../helpers/send';
import { games, gamesAll } from '../../models/game';

const pendingRequests = {};

export default {
  GenCodesSelectGameScene: function () {
    const scene = new BaseScene('gen-codes-select-game')
    
    scene.enter(async (ctx, next) => {
      const author = ctx.from
      const chatId = ctx.chat.id
      
      try {
        await inspectUserWrapper(chatId, author)
        
        const markup = Markup.inlineKeyboard(
          [
            ...games,
            gamesAll
          ].map((game) => Markup.button.callback(game.name, `select::generate::game::${game.id}`)),
          { columns: 2 },
        )
        await send(ctx, 'Выберите игру:', markup)
      } catch (error) {
        console.log(author.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
      }
      await next()
    })
    
    scene.action(/^select::generate::game(?:::(\w+))$/, async (ctx, next) => {
      const game = ctx.match[1]
      ctx.state.game = {
        id: game
      }
      //@ts-ignore
      await ctx.scene.enter('gen-codes-select-count')
      
      await next()
    })
    
    scene.on('message', async (ctx, next) => {
      // @ts-ignore
      await ctx.scene.leave()
      await next()
    })
    
    return scene
  },
  GenCodesSelectCountScene: function () {
    const scene = new BaseScene('gen-codes-select-count')
    const currState = {
      game: {}
    }
    
    scene.enter(async (ctx, next) => {
      const state = ctx.state
      
      currState.game = state.game
      
      let game = ''
      
      if( state.game.id === gamesAll.id  ) {
        game = gamesAll.name
      } else {
        game = games.find(game => game.id === state.game.id).name
      }
      const author = ctx.from
      try {
        await ctx.deleteMessage()
        
        await ctx.sendMessage(`*Вы выбрали ${game}*`,{parse_mode: 'MarkdownV2'});
        
        const markup = Markup.inlineKeyboard(
          ['1','2','3','4'].map((count, i) => Markup.button.callback(count, `select::generate::count::${count}`)),
          { columns: 2},
        )
        await ctx.sendMessage('Выберите количество генерируемых кодов:', markup)
      } catch (error) {
        console.log(author.username + ' ' + error.response?.error_code + ' ' + error.response?.description)
      }
      await next()
    })
    
    scene.action(/^select::generate::count(?:::(\w+))$/, async (ctx, next) => {
      const count = ctx.match[1]
      ctx.state.game = {
        ...currState.game,
        count
      }
      
      //@ts-ignore
      ctx.scene.enter('gen-codes-generate')
      
      await next()
    })
    
    scene.on('message', async (ctx, next) => {
      // @ts-ignore
      await ctx.scene.leave()
      await next()
    })
    
    return scene
  },
  
  GenCodesGenerateScene: function () {
    const scene = new BaseScene('gen-codes-generate')
    
    scene.enter(async (ctx) => {
      const chatId = ctx.chat.id
      const author = ctx.from
      const state = ctx.state
      
      try {
        if ( pendingRequests[chatId] ) {
          return await ctx.sendMessage(`У вас уже есть 1 активный запрос, дождитесь его окончания!`)
        }
        const progress = 0
        await ctx.deleteMessage()
        
        const message = await ctx.sendMessage(`Идет генерация кодов... ${progress}%`);
        
        pendingRequests[chatId] = true
        console.log(state.game.id)
        let keys = []
        let codes = ''
        if( state.game.id === 'all' ) {
          keys = await Promise.all(Array.from({ length: games.length }, async (empty, i) => {
            try {
              //@ts-ignore
              const keys = await generateKeys(state.game.count,  ctx,chatId, message.message_id,  progress, author.username, games[i].id, i === 2)
              
              return `*${games[i].name}*` + '\n\n`' + keys.filter(key => key).join('`\n\n`')?.toString() + '`'
            } catch (e) {
              console.log(e)
            }
          }));
          codes = '\n\n' + keys.filter(key => key).join('\n\n')?.toString()  + '\n\n'
        } else {
          keys = await generateKeys(state.game.count,  ctx,chatId, message.message_id, progress, author.username, state.game.id)
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
    })
    
    scene.on('message', async (ctx, next) => {
      // @ts-ignore
      await ctx.scene.leave()
      await next()
    })
    
    return scene
  }
}