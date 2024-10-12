import { Context, Markup, Scenes } from 'telegraf';
import { BaseScene } from 'telegraf/scenes';
import generateKeys from '../../controllers/generate-keys';
import generateKeysSafe from '../../controllers/generate-keys/safe-generator';
import SendPostToChat from '../../helpers/ads';
import checker from '../../helpers/checker';
import inspectUserWrapper from '../../helpers/inspect-user-wrapper';
import send from '../../helpers/send';
import { Games, games, gamesAll } from '../../models/game';

// Типизация сессии
type SessionGenerateData = {
  game?: Games,
  count?: number,
  pending?: boolean,
  abort?: AbortController,
};

const reqChannelIDs = ['-1002216264610', '-1002206346301']

// Типизация контекста сцены
type CodesSceneContext = Context & Scenes.SceneContext & { session: { generate: SessionGenerateData } };

export default {
  GenCodesBaseCheckSubscribeScene: function () {
    const scene = new BaseScene<CodesSceneContext>('gen-codes-check-subscribe')
    
    scene.enter(async (ctx, next) => {
      const author = ctx.from
      const chatId = ctx.chat.id
      
      try {
        await inspectUserWrapper(chatId, author)
        
        await ctx.sendMessage('*Вы выбрали Обычную генерацию*',{parse_mode:'MarkdownV2'})
        const subscribe = await checker(async (channel) => {
          const member = await ctx.telegram.getChatMember(channel, chatId)
          if (member.status != "member" && member.status != "administrator" && member.status != "creator"){
            return false;
          } else {
            return true;
          }
        }, ...reqChannelIDs)
        if( subscribe ) {
          
          await ctx.scene.enter('gen-codes-select-game')
        } else {
          const markup = Markup.inlineKeyboard(
            [1].map((game) => Markup.button.callback('Перейти к генерации', `goto::generate::base`)),
            { columns: 2 },
          )
          await send(ctx,
            '*Подпишись на каналы\\:*' +
            `\n\n` +
            '*Наш канал \\- [Хомячий Табор](https://t.me/+lZLomxu29j81NGQy)*' +
            `\n\n` +
            '*Блог создателя \\- [USKV](https://t.me/+Tx7AT4VBvMhlMGE6)*' +
            `\n\n` +
            '*Наш новый бот для получения кодов для видео \\- [Video Codes](https://t.me/videocodes_bot)*',
            {parse_mode: 'MarkdownV2', reply_markup:markup.reply_markup})
        }
      } catch (error) {
        console.log(author.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
      }
      await next()
    })
    
    scene.action('goto::generate::base', async (ctx, next) => {
      await ctx.scene.enter('gen-codes-select-game')
      
      await next()
    })
    
    scene.on('message', async (ctx, next) => {
      await ctx.scene.leave()
      await next()
    })
    
    return scene
  },
  GenCodesSelectGameScene: function () {
    const scene = new BaseScene<CodesSceneContext>('gen-codes-select-game')
    
    scene.enter(async (ctx, next) => {
      const author = ctx.from
      
      try {
        
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
    
    scene.enter(async (ctx, next) => {
      const chatId = ctx.chat.id
      const author = ctx.from
      
      const controller = new AbortController();
      
      ctx.session.generate.abort = controller
      
      try {
        const progress = 0
        await ctx.deleteMessage()
        if ( ctx.session.generate.pending ) {
          return await ctx.sendMessage(`У вас уже есть 1 активный запрос, дождитесь его окончания!`)
        }
        
        const markup = Markup.inlineKeyboard(
          [0].map((count, i) => Markup.button.callback('Остановить генерацию', `select::generate::stop`)),
          { columns: 2},
        )
        
        const message = await ctx.sendMessage(`Идет генерация кодов... ${progress}%`,markup);
        
        ctx.session.generate.pending = true
        console.log(ctx.session.generate.game + ' ' + 'base')
        console.log(`generation for ${author.username} has been started ` + new Date())
        let keys = []
        let codes = ''
        if( ctx.session.generate.game === gamesAll.id ) {
          keys = await Promise.all(Array.from({ length: games.length }, async (empty, i) => {
            try {
              const keys = await generateKeys(ctx.session.generate.count,  ctx,chatId, message.message_id,  progress, author.username, games[i].id, controller, i === 7)
              
              return `*${games[i].name}*` + '\n\n`' + keys.filter(key => key).join('`\n\n`')?.toString() + '`'
            } catch (e) {
              console.log(e)
            }
          }));
          codes = '\n\n' + keys.filter(key => key).join('\n\n')?.toString()  + '\n\n'
        } else {
          keys = await generateKeys(ctx.session.generate.count,  ctx,chatId, message.message_id, progress, author.username, ctx.session.generate.game, controller)
          codes = '\n\n`' + keys.filter(key => key).join('`\n\n`')?.toString() + '`\n\n'
        }
        ctx.session.generate = {}
        await ctx.telegram.deleteMessage(chatId, message.message_id)
        !controller.signal.aborted && await ctx.sendMessage(
          '*Коды успешно сгенерированы \\(нажмите на код, чтобы скопировать\\)\\:*' +
          `${codes}` +
          '*Подписывайся на наш канал \\- [Хомячий Табор](https://t.me/+lZLomxu29j81NGQy)*',
          {parse_mode: 'MarkdownV2'})
        await SendPostToChat(chatId)
        
      } catch (error) {
        console.log(author.username + ' ' + error.response?.error_code + ' ' + error.response?.description)
      }
      !controller.signal.aborted && console.log(`generation for ${author.username} has been finish ` + new Date())
      controller.abort('Request is finished')
      
      await ctx.scene.leave()
      await next()
    })
    
    scene.action('select::generate::stop', async (ctx, next) => {
      const author = ctx.from
      const controller = ctx.session.generate.abort
      try {
        await controller.abort('Request is canceled')
        ctx.session.generate = {}
        console.log(`generation for ${author.username} has been canceled ` + new Date())
        
        await ctx.scene.leave()
        await next()
      } catch (e) {
        console.log('Request is canceled')
      }
    })
    
    
    scene.on('message', async (ctx, next) => {
      ctx.sendMessage('Происходит генерация кодов, либо дождитесь окончания, либо остановите генерацию!')
    })
    
    return scene
  },
  GenCodesSafeCheckSubscribeScene: function () {
    const scene = new BaseScene<CodesSceneContext>('gen-codes-safe-check-subscribe')
    
    scene.enter(async (ctx, next) => {
      const author = ctx.from
      const chatId = ctx.chat.id
      
      try {
        await inspectUserWrapper(chatId, author)
        
        await ctx.sendMessage('*Вы выбрали Безопасную генерацию*',{parse_mode:'MarkdownV2'})
        const subscribe = await checker(async (channel) => {
          const member = await ctx.telegram.getChatMember(channel, chatId)
          if (member.status != "member" && member.status != "administrator" && member.status != "creator"){
            return false;
          } else {
            return true;
          }
        }, ...reqChannelIDs)
        if( subscribe ) {
          
          await ctx.scene.enter('gen-codes-safe-select-game')
        } else {
          const markup = Markup.inlineKeyboard(
            [1].map((game) => Markup.button.callback('Перейти к генерации', `goto::generate::safe`)),
            { columns: 2 },
          )
          await send(ctx,
            '*Подпишись на каналы\\:*' +
            `\n\n` +
            '*Наш канал \\- [Хомячий Табор](https://t.me/+lZLomxu29j81NGQy)*' +
            `\n\n` +
            '*Блог создателя \\- [USKV](https://t.me/+Tx7AT4VBvMhlMGE6)*' +
            `\n\n` +
            '*Наш новый бот для получения кодов для видео \\- [Video Codes](https://t.me/videocodes_bot)*',
            {parse_mode: 'MarkdownV2', reply_markup:markup.reply_markup})
        }
      } catch (error) {
        console.log(author.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
      }
      await next()
    })
    
    scene.action('goto::generate::safe', async (ctx, next) => {
      await ctx.scene.enter('gen-codes-safe-select-game')
      
      await next()
    })
    
    scene.on('message', async (ctx, next) => {
      await ctx.scene.leave()
      await next()
    })
    
    return scene
  },
  
  GenCodesSafeSelectGameScene: function () {
    const scene = new BaseScene<CodesSceneContext>('gen-codes-safe-select-game')
    
    scene.enter(async (ctx, next) => {
      const author = ctx.from
      
      try {
        
        const markup = Markup.inlineKeyboard(
          [
            ...games,
            gamesAll
          ].map((game) => Markup.button.callback(game.name, `select::generate::game::${game.id}`)),
          { columns: 2 },
        )
        await send(ctx,  'Выберите игру:', markup)
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
      
      await ctx.scene.enter('gen-codes-safe-select-count')
      
      await next()
    })
    
    scene.on('message', async (ctx, next) => {
      await ctx.scene.leave()
      await next()
    })
    
    return scene
  },
  GenCodesSafeSelectCountScene: function () {
    const scene = new BaseScene<CodesSceneContext>('gen-codes-safe-select-count')
    
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
      
      ctx.scene.enter('gen-codes-safe-generate')
      
      await next()
    })
    
    scene.on('message', async (ctx, next) => {
      await ctx.scene.leave()
      await next()
    })
    
    return scene
  },
  
  GenCodesSafeGenerateScene: function () {
    const scene = new BaseScene<CodesSceneContext>('gen-codes-safe-generate')
    
    scene.enter(async (ctx, next) => {
      const chatId = ctx.chat.id
      const author = ctx.from
      
      const controller = new AbortController();
      
      ctx.session.generate.abort = controller
      
      try {
        const progress = 0
        await ctx.deleteMessage()
        if ( ctx.session.generate.pending ) {
          return await ctx.sendMessage(`У вас уже есть 1 активный запрос, дождитесь его окончания!`)
        }
        const markup = Markup.inlineKeyboard(
          [0].map(() => Markup.button.callback('Остановить генерацию', `select::generate::stop`)),
          { columns: 2},
        )
        
        const message = await ctx.sendMessage(`Идет генерация кодов\\.\\.\\. ${progress}%` + '\n' + '_\\(Может занять много времени\\)_',{reply_markup:markup.reply_markup,parse_mode:'MarkdownV2'});
        
        ctx.session.generate.pending = true
        console.log(ctx.session.generate.game + ' ' + 'safe')
        console.log(`generation for ${author.username} has been started ` + new Date())
        let keys = []
        let codes = ''
        if( ctx.session.generate.game === gamesAll.id ) {
          keys = await Promise.all(Array.from({ length: games.length }, async (empty, i) => {
            try {
              const keys = await generateKeysSafe(ctx.session.generate.count,  ctx,chatId, message.message_id,  progress, author.username, games[i].id, controller,i === 7)
              
              return `*${games[i].name}*` + '\n\n`' + keys.filter(key => key).join('`\n\n`')?.toString() + '`'
            } catch (e) {
              console.log('da')
              console.log(e)
            }
          }));
          codes = '\n\n' + keys.filter(key => key).join('\n\n')?.toString()  + '\n\n'
        } else {
          keys = await generateKeysSafe(ctx.session.generate.count,  ctx,chatId, message.message_id, progress, author.username, ctx.session.generate.game,controller)
          codes = '\n\n`' + keys.filter(key => key).join('`\n\n`')?.toString() + '`\n\n'
        }
        ctx.session.generate = {}
        await ctx.telegram.deleteMessage(chatId, message.message_id)
        !controller.signal.aborted && await ctx.sendMessage(
          '*Коды успешно сгенерированы \\(нажмите на код, чтобы скопировать\\)\\:*' +
          `${codes}` +
          '*Подписывайся на наш канал \\- [Хомячий Табор](https://t.me/+lZLomxu29j81NGQy)*',
          {parse_mode: 'MarkdownV2'})
        await SendPostToChat(chatId)
        
      } catch (error) {
        console.log(author.username + ' ' + error.response?.error_code + ' ' + error.response?.description)
      }
      !controller.signal.aborted && console.log(`generation for ${author.username} has been finish ` + new Date())
      controller.abort('Request is finished')
      await ctx.scene.leave()
      await next()
    })
    
    scene.action('select::generate::stop', async (ctx, next) => {
      const author = ctx.from
      const controller = ctx.session.generate.abort
      try {
        await controller.abort('Request is canceled')
        ctx.session.generate = {}
        console.log(`generation for ${author.username} has been canceled ` + new Date())
        
        await ctx.scene.leave()
        await next()
      } catch (e) {
        console.log('Request is canceled')
      }
    })
    
    scene.on('message', async (ctx, next) => {
      ctx.sendMessage('Происходит генерация кодов, либо дождитесь окончания, либо остановите генерацию!')
    })
    
    return scene
  },
}