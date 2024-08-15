require('dotenv').config()
import express from 'express'
import cors from 'cors'
import config from './config';
import generateKeys from './controllers/generate-keys';
import handlers from './handlers';
import send from './helpers/send';
import { Services } from './services';
import { Telegraf, Markup } from 'telegraf';
import { UsersSlices } from './slices/users';

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

export const games = [
  { id:'bike', name: "Riding Extreme 3D" },
  { id:'cube', name: "Chain Cube" },
  { id:'clone', name: "My Clone Army" },
  { id:'miner', name: "Train Miner" },
  { id:'all', name: "Все игры" }
]

bot.start(handlers.base.start)

bot.command('gencodes', handlers.keys.selectGenerateGame)

bot.action(/^select::generate::game(?:::(\w+))$/, handlers.keys.selectGenerateCount);

bot.action(/^select::generate::count(?:::(\w+))$/, handlers.keys.generate);

bot.command('projects', handlers.projects.selectProject)

bot.action(/^select::project(?:::(\w+))$/, handlers.projects.getProjectServices);



run()