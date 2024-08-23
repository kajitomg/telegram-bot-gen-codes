require('dotenv').config()
import express from 'express'
import cors from 'cors'
import config from './config';
import handlers from './handlers';
import scenes from './scenes';
import { Services } from './services';
import { Telegraf, Scenes, session, Composer } from 'telegraf';

export const services = new Services(config)

export const bot = new Telegraf<Scenes.SceneContext>(process.env.API_KEY_BOT );

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

const stage = new Scenes.Stage<Scenes.SceneContext>(scenes)

const authUsers = [
  806145885,
  1259372103
]

bot.use(session())
bot.use(stage.middleware())

const userBot = new Composer<Scenes.SceneContext>();

const adminBot = new Composer<Scenes.SceneContext>();

userBot.start(handlers.base.start)

userBot.command('gencodes', async ctx => {
  return await ctx.scene.enter('gen-codes-select-game')
})

adminBot.command('broadcast', async ctx => {
  return await ctx.scene.enter('broadcast-start')
})

adminBot.command('gencodessafe', async ctx => {
  return await ctx.scene.enter('gen-codes-safe-check-subscribe')
})

adminBot.command('projects', handlers.projects.selectProject)

adminBot.action(/^select::project(?:::(\w+))$/, handlers.projects.getProjectServices);

userBot.on('message', handlers.base.default)

bot.use(Composer.acl(authUsers,adminBot))

bot.use(userBot)



run()