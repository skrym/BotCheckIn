const Telegraf = require("telegraf")

const bot = new Telegraf(process.env.BOT_TOKEN)

;(async () => {
  await bot.launch()
  console.log('TelegramBot: Bot is started')
})()

module.exports = bot
