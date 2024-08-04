require('dotenv').config()
import express from 'express'
import cors from 'cors'
import config from './config';
import generateKeys from './controllers/generate-keys';
import { Services } from './services';

export const services = new Services(config)

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.API_KEY_BOT, {
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

const pendingRequests = {};

const callbackQuery = async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id
  
  await bot.deleteMessage(chatId,msg.message_id)
  
  await bot.answerCallbackQuery(callbackQuery.id);
  
  const { data = "" } = callbackQuery;
  
  if(msg.text === 'Выбери количество генерируемых кодов') {
    if ( pendingRequests[chatId] ) {
      return await bot.sendMessage(chatId, `У вас уже есть 1 активный запрос, дождитесь его окончания!`,{})
    }
    const progress = 0
    const message = await bot.sendMessage(chatId, `Идет генерация кодов... ${progress}%`,{})
    pendingRequests[chatId] = true
    const keys = await generateKeys(data,  bot, chatId, message.message_id, progress)
    await bot.deleteMessage(chatId,message.message_id)
    await bot.sendMessage(chatId, `Коды успешно сгенерированы (нажмите, чтобы скопировать):`,{})
    await bot.sendMessage(chatId, '`' + `${keys.filter(key => key).join('`\n\n`')?.toString()}  ` + '`', {
      parse_mode: 'MarkdownV2',
      disable_notification: true
    })
    delete pendingRequests[chatId]
    /*keys.map(async (key) => {
      // @ts-ignore
      key?.toString() && await bot.sendMessage(chatId, '`' + `${key?.toString()}` + '`', {
        parse_mode: 'MarkdownV2',
        disable_notification: true
      })
    })*/
  }
};

// После инициализации бота, задать обработчик
bot.on("callback_query", callbackQuery);

bot.on('text', async msg => {
  const chatId = msg.chat.id
  const text = msg.text
  
  if (text === '/start') {
    const message = await bot.sendMessage(chatId, `Для генерации кодов введите команду /genkeys`,{parse_mode: 'MarkdownV2'})
  } else if (text === '/genkeys') {
    const message = await bot.sendMessage(chatId, `Выбери количество генерируемых кодов`,{
      reply_markup: {
        inline_keyboard: [
          [{text: '1', callback_data: 1},{text: '2', callback_data: 2}],
          [{text: '3', callback_data: 3},{text: '4', callback_data: 4}],
        ],
      },
    })
    
  }
  else {
    await bot.sendMessage(chatId, 'Неизвестная команда',{})
  }
})

run()