import { Markup } from 'telegraf';
import { bold, fmt, FmtString } from 'telegraf/format';
import { BaseScene } from 'telegraf/scenes';
import send from '../../helpers/send';
import { sleep } from '../../helpers/sleep';
import db from '../../services/database';

const broadcastButtons = [{id:'getCurrentBroadcast',name:'Получить текущее сообщение'},{id:'createBroadcast',name:'Создать новое сообщение'}]

const text = {
  value:null,
  entities:null,
}

export default {
  start: function () {
    const scene = new BaseScene('broadcast-start')
    scene.enter(async (ctx) => {
      const markup = Markup.inlineKeyboard(
        broadcastButtons.map((button) => Markup.button.callback(button.name, `select::broadcast::${button.id}`)),
        { columns: 2 },
      )
      await send(ctx, 'Выберите интересующее вас действие:', markup)
    })
    
    scene.action('select::broadcast::getCurrentBroadcast', async (ctx) => {
// @ts-ignore
      ctx.scene.enter('broadcast-get-current')
    })
    
    scene.action('select::broadcast::createBroadcast', async (ctx) => {
// @ts-ignore
      ctx.scene.enter('broadcast-create')
    })
    scene.on('text', async (ctx) => {
// @ts-ignore
      ctx.scene.reenter()
    })
    
    return scene
  },
  
  getCurrentBroadcast: function () {
    const scene = new BaseScene('broadcast-get-current')
    scene.enter(async (ctx) => {
      const markup = Markup.inlineKeyboard(
        [...(text ? [Markup.button.callback('Запустить пост', `select::broadcast::launch`)] : []),Markup.button.callback('Сменить пост', `select::broadcast::change`),
        Markup.button.callback('Назад к списку действий', `select::broadcast::back`)],
        { columns: 2 },
      )
      const msg = new FmtString(text.value, text.entities)
      await send(ctx, fmt(bold('Текущий пост'),'\n\n',text.value ? msg : 'Нет поста'),{reply_markup:markup.reply_markup})
    })
    
    scene.action('select::broadcast::back', async (ctx) => {
// @ts-ignore
      ctx.scene.enter('broadcast-start')
    })
    
    scene.action('select::broadcast::launch', async (ctx) => {
// @ts-ignore
      ctx.scene.enter('broadcast-launch')
    })
    
    scene.action('select::broadcast::change', async (ctx) => {
// @ts-ignore
      ctx.scene.enter('broadcast-create')
    })
    
    return scene
  },
  
  createBroadcast: function () {
    const scene = new BaseScene('broadcast-create')
    scene.enter(async (ctx) => {
      const markup = Markup.inlineKeyboard(
        [Markup.button.callback('Назад к списку действий', `select::broadcast::back`)],
        { columns: 2 },
      )
      await send(ctx, '*Введите сообщение:*', {parse_mode: 'MarkdownV2', reply_markup:markup.reply_markup})
    })
    scene.on('text', async (ctx) => {
      text.value = await ctx.message.text
      text.entities = await ctx.message.entities
// @ts-ignore
      await ctx.scene.enter('broadcast-get-current')
    })
    
    scene.action('select::broadcast::back', async (ctx) => {
// @ts-ignore
      ctx.scene.enter('broadcast-start')
    })
    
    return scene
  },
  
  launchBroadcast: function () {
    const scene = new BaseScene('broadcast-launch')
    scene.enter(async (ctx) => {
      const markup = Markup.inlineKeyboard(
        [...(text ? [Markup.button.callback('Запустить пост', `select::broadcast::launch`)] : []),Markup.button.callback('Сменить пост', `select::broadcast::change`),
          Markup.button.callback('Назад к списку действий', `select::broadcast::back`)],
        { columns: 2 },
      )
      const msg = new FmtString(text.value, text.entities)
      await send(ctx, fmt(bold('Вы уверены, что хотите запустить рассылку?'),'\n\n',text.value ? msg : 'Нет поста'),{reply_markup:markup.reply_markup})
    })
    scene.action('select::broadcast::back', async (ctx) => {
      // @ts-ignore
      ctx.scene.enter('broadcast-start')
    })
    
    scene.action('select::broadcast::launch', async (ctx) => {
      const author = ctx.from
      const msg = new FmtString(text.value, text.entities)
      await db.userDB.readDistinctUsers(async (err, rows) => {
        if (err) {
          console.log(err);
          console.log('Произошла ошибка при поиске пользователя');
        } else {
          try {
            // @ts-ignore
            rows.map(async (row) => {
              try {
                await ctx.telegram.sendMessage(row.chat_id,msg)
              } catch (error) {
                console.log(error)
                console.log(author.username + ' ' + error.response?.error_code + ' ' + error.response?.description)
              }
            })
            ctx.deleteMessage()
          } catch (error) {
            console.log(author.username + ' ' + error.response?.error_code + ' ' + error.response?.description)
          }
        }
      })
      // @ts-ignore
      
      await ctx.scene.leave()
    })
    
    scene.action('select::broadcast::change', async (ctx) => {
      // @ts-ignore
      ctx.scene.enter('broadcast-create')
    })
    
    return scene
  }
}