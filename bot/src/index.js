require('dotenv').config();

const {BOT_TOKEN} = process.env;

const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Extra = require ("telegraf/extra");
const Markup = require ("telegraf/markup");

//commands
const startCommand = require("./commands/start");
const AnketaStage = require("./stage/anketa");
const { callbackButton } = require('telegraf/markup');

const app = require("./express")
const redisClient = require("./redis")
const bot = require("./bot")

// middleware
bot.use(session())
bot.use(AnketaStage.middleware())

// commands
bot.start(startCommand());

bot.hears('Заполнить анкету 📄',  (ctx)  =>  ctx.scene.enter('fio'));

// Actions

bot.action(/Confirm/, ({ telegram, chat, callbackQuery, inlineMessageId, match }) => {
    const { message } = callbackQuery

    // Ответ заявочнику
    const chatId = match.input.split('_')[1]
    telegram.sendMessage(chatId, "Ваша заявка принята, скоро наш аминистратор добавит Вас в группу");

    // Редактирование сообщения админа
    const newText = `${message.text}\n\nЗаявка Принята`
    telegram.editMessageText(chat.id, message.message_id, inlineMessageId, newText, Extra.markup())
});

bot.action(/Reject/, ({ telegram, chat, callbackQuery, inlineMessageId, match }) => {
    const { message } = callbackQuery

    // Ответ заявочнику
    const chatId = match.input.split('_')[1]
    telegram.sendMessage(chatId, "Ваша заявка отклонена");

    // Редактирование сообщения админа
    const newText = `${message.text}\n\nЗаявка Отклонена`
    telegram.editMessageText(chat.id, message.message_id, inlineMessageId, newText, Extra.markup())
});

app.get('/', (req,res) => {
  console.log('YRA!!!!!!!!!!!!!!!!!!')
  res.send('privetik')
})

app.post('/fb_user', async (req, res) => {
    console.log(req.body)
    redisClient.get(`${req.body.tgUser}`, (err, data) => {
        const {name, username, phone, chatId} = JSON.parse(data)
        bot.telegram.sendMessage(816382988, 
`Фио: ${name}, 
Tg UserName: @${username}, 
UserId: ${chatId}
Номер телефона: ${phone}, 

Facebook:
Имя: ${req.body.name}
id: ${req.body.id}`, 
        AdminButtons(chatId))
        bot.telegram.sendPhoto(816382988, `https://graph.facebook.com/${req.body.id}/picture?type=large`)
        res.send({status: 'OK'})
    })
})

const AdminButtons = (id)  => ({
    reply_markup:{
        inline_keyboard:[
            [{text: 'Подтвердить', callback_data: `Confirm_${id}`}],
            [{text: 'Отклонить', callback_data: `Reject_${id}`}],
        ], resize_keyboard: true, 
    }
})
