const defaultBuildUrl = process.env.DEFAULT_BUILD_URL || 'http://127.0.0.1/_team/_project/_pipeline';
const defaultChatId = process.env.TELEGRAM_CHAT_ID;
const defaultCommitId = process.env.DEFAULT_COMMIT_ID || '12345678';
const defaultEnvironment = process.env.DEFAULT_ENVIRONMENT || 'general';
const defaultLocale = process.env.DEFAULT_LOCALE || 'en';
const defaultToken = process.env.TELEGRAM_BOT_TOKEN;
const defaultTriggerMessage = process.env.DEFAULT_TRIGGER_MESSAGE ? process.env.DEFAULT_TRIGGER_MESSAGE : true;
const defaultVictim = process.env.DEFAULT_VICTIM || 'somebody';

module.exports = {
  buildUrl: defaultBuildUrl,
  chatId: defaultChatId,
  commitId: defaultCommitId,
  environment: defaultEnvironment,
  locale: defaultLocale,
  token: defaultToken,
  triggerMessage: defaultTriggerMessage,
  victim: defaultVictim,
};
