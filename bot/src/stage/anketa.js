const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const Markup = require ("telegraf/markup");
const Extra = require ("telegraf/extra");

const redisClient = require("../redis")

const FIO = new Scene('fio')
FIO.enter((ctx) => ctx.reply('Введите Ваше Фамилия Имя Отчество', Extra.markup(Markup.removeKeyboard(true))))
FIO.on('text', (ctx) => {
    ctx.session.name = ctx.message.text
    ctx.session.user = ctx.message.chat.username
    ctx.session.id = ctx.message.chat.id
    ctx.scene.enter('phone')
})

const Phone = new Scene('phone')
Phone.enter((ctx) => ctx.reply('Поделитесь с нами Вашим номером телефона', PhoneButtons))
Phone.on('contact', (ctx) => {
    ctx.session.tel = ctx.message.contact.phone_number

    ctx.scene.enter('facebook')
})

const Face = new Scene('facebook')
Face.enter(async (ctx) => {
    ctx.reply('Для завершение пройдите по ссылке, авторизируйтесь через ваш фейбук аккаунт и ожидайте ответа администратора', FaceButton(ctx.session.id));
    redisClient.set(String(ctx.session.id), JSON.stringify({
        name: ctx.session.name,
        username: ctx.session.user,
        chatId: ctx.session.id,
        phone: ctx.session.tel
    }), (r) => {
        setTimeout(() => redisClient.del(`${ctx.session.id}`), 1000 * 60 * 120)
    })
    const msgId = await ctx.telegram.sendMessage(816382988, `Фио: ${ctx.session.name}, UserName: @${ctx.session.user}, номер телефона: ${ctx.session.tel}, Instagram:`, AdminButtons(ctx.session.id))
        .then(ctx2 => ctx2.message_id);
})

const PhoneButtons = {
    reply_markup:{
        keyboard:[
            [{text:'Поделиться номером', request_contact: true}],
        ], resize_keyboard: true, one_time_keyboard: true
    }
}
const FaceButton = (id) => ({
    reply_markup:{
        inline_keyboard:[
            [{text:'Авторизоваться', url:`https://iith.me?user=${id}`}],
        ], resize_keyboard: true
    }
});


const AdminButtons = (id)  => ({
    reply_markup:{
        inline_keyboard:[
            [{text: 'Подтвердить', callback_data: `Confirm_${id}`}],
            [{text: 'Отклонить', callback_data: `Reject_${id}`}],
        ], resize_keyboard: true, 
    }
});


const AnketaStage = new Stage([FIO, Phone, Face])


module.exports = AnketaStage