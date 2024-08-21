import { Context, Markup, Scenes } from 'telegraf';
import { BaseScene } from 'telegraf/scenes';
import generateKeys from '../../controllers/generate-keys';
import inspectUserWrapper from '../../helpers/inspect-user-wrapper';
import send from '../../helpers/send';
import { Games, games, gamesAll } from '../../models/game';

// Типизация сессии
type SessionGenerateData = {
  game?: Games,
  count?: number,
  pending?: boolean,
};

// Типизация контекста сцены
type CodesSceneContext = Context & Scenes.SceneContext & { session: { generate: SessionGenerateData } };

export default {
  GenCodesSelectGameScene: function () {
    const scene = new BaseScene<CodesSceneContext>('gen-codes-select-game')
    
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
      const game = ctx.match[1] as Games
      
      if ( !ctx.session.generate ) {
        ctx.session.generate = {}
      }
      
      ctx.session.generate.game = game
      
      await ctx.scene.enter('gen-codes-select-count')
      
      await next()
    })
    
    scene.on('message', async (ctx, next) => {
      await ctx.scene.leave()
      await next()
    })
    
    return scene
  },
  GenCodesSelectCountScene: function () {
    const scene = new BaseScene<CodesSceneContext>('gen-codes-select-count')
    
    scene.enter(async (ctx, next) => {
      
      let game = ''
      
      if( ctx.session.generate.game === gamesAll.id  ) {
        game = gamesAll.name
      } else {
        game = games.find(game => game.id === ctx.session.generate.game)?.name
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
      const count = +ctx.match[1]
      
      ctx.session.generate.count = count
      
      ctx.scene.enter('gen-codes-generate')
      
      await next()
    })
    
    scene.on('message', async (ctx, next) => {
      await ctx.scene.leave()
      await next()
    })
    
    return scene
  },
  
  GenCodesGenerateScene: function () {
    const scene = new BaseScene<CodesSceneContext>('gen-codes-generate')
    
    scene.enter(async (ctx) => {
      const chatId = ctx.chat.id
      const author = ctx.from
      
      try {
        const progress = 0
        await ctx.deleteMessage()
        if ( ctx.session.generate.pending ) {
          return await ctx.sendMessage(`У вас уже есть 1 активный запрос, дождитесь его окончания!`)
        }
        
        const message = await ctx.sendMessage(`Идет генерация кодов... ${progress}%`);
        
        ctx.session.generate.pending = true
        console.log(ctx.session.generate.game)
        let keys = []
        let codes = ''
        if( ctx.session.generate.game === gamesAll.id ) {
          keys = await Promise.all(Array.from({ length: games.length }, async (empty, i) => {
            try {
              const keys = await generateKeys(ctx.session.generate.count,  ctx,chatId, message.message_id,  progress, author.username, games[i].id, i === 2)
              
              return `*${games[i].name}*` + '\n\n`' + keys.filter(key => key).join('`\n\n`')?.toString() + '`'
            } catch (e) {
              console.log(e)
            }
          }));
          codes = '\n\n' + keys.filter(key => key).join('\n\n')?.toString()  + '\n\n'
        } else {
          keys = await generateKeys(ctx.session.generate.count,  ctx,chatId, message.message_id, progress, author.username, ctx.session.generate.game)
          codes = '\n\n`' + keys.filter(key => key).join('`\n\n`')?.toString() + '`\n\n'
        }
        ctx.session.generate = {}
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
      await ctx.scene.leave()
      await next()
    })
    
    return scene
  }
}