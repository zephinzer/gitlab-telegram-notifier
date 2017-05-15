const TelegramBot = require('node-telegram-bot-api');
const defaults = require('./defaults');

let bot = null;

function getInstance() {
  if(bot === null) {
    bot = new TelegramBot(defaults.token, {polling: true});
  }
  return bot;
}

function send(message, _options) {
  const options = _options || { parse_mode: 'Markdown' };
  bot.sendMessage((options ? (options.chatId || defaults.chatId) : defaults.chatId), message, options);
}

module.exports = {
  getInstance,
  send
};