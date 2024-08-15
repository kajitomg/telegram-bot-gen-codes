require('dotenv').config()
import express from 'express'
import cors from 'cors'
import config from './config';
import { callbackQueryRoutes, textRoutes } from './routes';
import { Services } from './services';

export const services = new Services(config)

import TelegramBot from 'node-telegram-bot-api';

export const bot = new TelegramBot(process.env.API_KEY_BOT, {
  polling: true
});

const app = express()

app.use(cors({
  credentials: true,
}))
app.use(express.urlencoded({extended: true}));
app.use(express.json())

const PORT = +(process.env.PORT || 5000)

const run = () => {
  try {
    app.listen(PORT, () => console.log(`Server has been started on ${PORT} port`))
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
  { id:'merge', name: "Merge Away" },
  { id:'all', name: "Все игры" }
]

bot.on("callback_query", callbackQueryRoutes(bot));

bot.on('text', textRoutes(bot))

run()