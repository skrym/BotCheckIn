module.exports = () => async (ctx)=>{
  ctx.reply(`
  Привет👋
  Этот бот сделан для того, чтобы мы познакомились с вами и вы получили доступ к нашему телеграмм каналу🤝 Нам это нужно для того, чтобы понять, что вы не бот, а реальный человек- не более того🦾 
  Конфиденциальность ваших данных мы гарантируем 🙈🙉🙊
  
  Если вы готовы- нажмите заполнить анкету👇
  `, AnketButtons );
  // console.log (ctx); 
  }

  const AnketButtons = {
    reply_markup:{
        keyboard:[
            [{text:'Заполнить анкету 📄'}],
        ], resize_keyboard: true,
        one_time_keyboard: true,
    }
}