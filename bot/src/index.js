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
bot.hears('Генерировать ссылку',  (ctx)=>{
    ctx.reply('Нажмите на кнопку и перейди в телеграмм канал', OkButton).then(data => setTimeout(() =>  
        ctx.telegram.editMessageText(data.chat.id, data.message_id, null, 'Спасибо за регистрацию', Extra.markup()), 10000))

});


// Actions

bot.action(/Confirm/, ({ telegram, chat, callbackQuery, inlineMessageId, match }) => {
    const { message } = callbackQuery

    // Ответ заявочнику
    const chatId = match.input.split('_')[1]
    telegram.sendMessage(chatId, "Ваша заявка принята, нажмите на кнопку и сгенерируйте свою индивидуальную ссылку.\nP.S. Ссылка будет работать на протяжении 10 секунд", GetButton);


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
        bot.telegram.sendMessage(process.env.ADMIN, 
`Фио: ${name}, 
Tg UserName: @${username}, 
UserId: ${chatId}
Номер телефона: ${phone}, 

Facebook:
Имя: ${req.body.name}
id: ${req.body.id}`, 
        AdminButtons(chatId))
        bot.telegram.sendPhoto(process.env.ADMIN, `https://graph.facebook.com/${req.body.id}/picture?type=large`)
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

const GetButton = {
    reply_markup:{
        keyboard:[
            [{text:'Генерировать ссылку'}],
        ], resize_keyboard: true, one_time_keyboard: true
    }
}

const OkButton = {
    reply_markup:{
        inline_keyboard:[
            [{text:'Перейти в группу', url:`https://t.me/joinchat/AAAAAEvxj1IUX8JT6cDbUg`}],
        ], resize_keyboard: true
    }
}
