require('dotenv').config()
import express from 'express'
import cors from 'cors'
import config from './config';
import handlers from './handlers';
import scenes from './scenes';
import { Services } from './services';
import { Telegraf, Scenes, session  } from 'telegraf';

export const services = new Services(config)

export const bot = new Telegraf(process.env.API_KEY_BOT );

const app = express()

app.use(cors({
  credentials: true,
}))
app.use(express.urlencoded({extended: true}));
app.use(express.json())

const PORT = +(process.env.PORT || 5000)

const run = async () => {
  try {
    await app.listen(PORT, () => console.log(`Server has been started on ${PORT} port`))
    await bot.launch()
    
  }
  catch (e) {
    console.log(e)
  }
}

// @ts-ignore
const stage = new Scenes.Stage(scenes)

const authUsers = [
  806145885,
  1259372103
]

bot.use(session())
bot.use(stage.middleware())

bot.start(handlers.base.start)

bot.command('gencodes', handlers.keys.selectGenerateGame)

// @ts-ignore
bot.command('broadcast', async ctx => {
  const admin = authUsers.includes(ctx.chat.id)
  if(admin) {
    // @ts-ignore
    return await ctx.scene.enter('broadcast-start')
  } else {
    return await handlers.base.default(ctx)
  }
})

bot.action(/^select::generate::game(?:::(\w+))$/, handlers.keys.selectGenerateCount);

bot.action(/^select::generate::count(?:::(\w+))$/, handlers.keys.generate);

bot.command('projects', handlers.projects.selectProject)

bot.action(/^select::project(?:::(\w+))$/, handlers.projects.getProjectServices);

bot.on('message', handlers.base.default)



run()