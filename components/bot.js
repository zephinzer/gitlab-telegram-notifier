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
  const options = _options || {};
  Object.assign(options, { parse_mode: 'Markdown' });
  const chatId = (options ? (options.chatId || defaults.chatId) : defaults.chatId);
  (chatId) && bot.sendMessage(chatId, message, options);
}

module.exports = {
  getInstance,
  send
};