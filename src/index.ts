require('dotenv').config()
import express from 'express'
import cors from 'cors'
import config from './config';
import generateKeys from './controllers/generate-keys';
import { Services } from './services';
import db from './services/database';

export const services = new Services(config)

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.API_KEY_BOT, {
  polling: true
});

const app = express()

let games = [
  { id:'bike', name: "Riding Extreme 3D" },
  { id:'cube', name: "Chain Cube" },
  { id:'clone', name: "My Clone Army" },
  { id:'miner', name: "Train Miner" }
]

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
  try {
    await bot.deleteMessage(chatId,msg.message_id)
    
    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
  }
  
  const { data = "" } = callbackQuery;
  if(msg.text === 'Выберите игру:') {
    try {
      const variant = games[data]
      await bot.sendMessage(chatId, `Вы выбрали ${variant.name}`,{})
      if(!pendingRequests[chatId]) {
        pendingRequests[chatId] = {}
      }
      pendingRequests[chatId].variant = variant.id
      await bot.sendMessage(chatId, `Выберите количество генерируемых кодов:`,{
        reply_markup: {
          inline_keyboard: [
            [{text: '1', callback_data: 1},{text: '2', callback_data: 2}],
            [{text: '3', callback_data: 3},{text: '4', callback_data: 4}],
          ],
        },
      })
    } catch (error) {
      console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
    }
  }
  
  if(msg.text === 'Выберите количество генерируемых кодов:') {
    try {
      if ( pendingRequests[chatId]?.pending ) {
        return await bot.sendMessage(chatId, `У вас уже есть 1 активный запрос, дождитесь его окончания!`,{})
      }
      const progress = 0
      const message = await bot.sendMessage(chatId, `Идет генерация кодов... ${progress}%`,{})
      pendingRequests[chatId].pending = true
      console.log(pendingRequests[chatId].variant)
      const keys = await generateKeys(data,  bot, chatId, message.message_id, progress, msg.chat.username, pendingRequests[chatId].variant)
      delete pendingRequests[chatId]
      await bot.deleteMessage(chatId,message.message_id)
      await bot.sendMessage(chatId,
        '*Коды успешно сгенерированы \\(нажмите, чтобы скопировать\\)\\:*' +
        '\n\n`' +
        `${keys.filter(key => key).join('`\n\n`')?.toString()}` +
        '`\n\n' +
        '*Подписывайся на наш канал \\- [Хомячий Табор](https://t.me/+lZLomxu29j81NGQy)*',
        { parse_mode: 'MarkdownV2'}
      )
      
    } catch (error) {
      console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
    }
  }
};

// После инициализации бота, задать обработчик
bot.on("callback_query", callbackQuery);

bot.on('text', async msg => {
  const chatId = msg.chat.id
  const text = msg.text
  
  if (text === '/start') {
    try {
      await db.userDB.readUserBy({chat_id: chatId}, async (err, rows) => {
        if (err) {
          console.log(err);
          console.log('Произошла ошибка при поиске пользователя');
        } else {
          if (!rows[0]) {
            await db.userDB.createUser({
              chat_id:chatId,
              user_id:msg.chat.username,
              username:msg.chat.first_name,
            }, async (err, rows) => {
              if(err) {
                console.log('Произошла ошибка при создании пользователя')
              } else {
                const message = await bot.sendMessage(chatId, `Cпасибо за использование нашего бота\\!\n\nДля генерации кодов введите команду /gencodes`, { parse_mode: 'MarkdownV2' })
              }
            })
          } else {
            const message = await bot.sendMessage(chatId, `Для генерации кодов введите команду /gencodes`, { parse_mode: 'MarkdownV2' })
          }
        }
      })
    } catch (error) {
        console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
    }
  } else if (text === '/gencodes') {
    try {
      await db.userDB.readUserBy({chat_id: chatId}, async (err, rows) => {
        if (err) {
          console.log(err);
          console.log('Произошла ошибка при поиске пользователя');
        } else {
          if (!rows[0]) {
            await db.userDB.createUser({
              chat_id:chatId,
              user_id:msg.chat.username,
              username:msg.chat.first_name,
            }, async (err, rows) => {
              if(err) {
                console.log('Произошла ошибка при создании пользователя')
              }
            })
          }
        }
      })
      const message = await bot.sendMessage(chatId, `Выберите игру:`,{
        reply_markup: {
          inline_keyboard: [
            [{text: games[0].name, callback_data: 0},{text: games[1].name, callback_data: 1}],
            [{text: games[2].name, callback_data: 2},{text: games[3].name, callback_data: 3}],
          ],
        },
      })
    } catch (error) {
      console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
    }
    
  }
  else {
    try {
      await bot.sendMessage(chatId, 'Неизвестная команда, для генерации кодов введите команду /gencodes',{})
    } catch (error) {
      console.log(msg.chat.username + ' ' + error.response?.body?.error_code + ' ' + error.response?.body?.description)
    }
  }
})

run()