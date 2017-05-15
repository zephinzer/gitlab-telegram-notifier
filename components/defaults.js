const defaultChatId = process.env.TELEGRAM_CHAT_ID;
const defaultCommitId = process.env.DEFAULT_COMMIT_ID || '12345678';
const defaultEnvironment = process.env.DEFAULT_ENVIRONMENT || 'general';
const defaultLocale = process.env.DEFAULT_LOCALE || 'en';
const defaultToken = process.env.TELEGRAM_BOT_TOKEN;
const defaultVictim = process.env.DEFAULT_VICTIM || 'somebody';

module.exports = {
  chatId: defaultChatId,
  commitId: defaultCommitId,
  environment: defaultEnvironment,
  locale: defaultLocale,
  victim: defaultVictim,
  token: defaultToken,
};
