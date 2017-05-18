const defaultBuildUrl = process.env.DEFAULT_BUILD_URL || 'http://127.0.0.1/_team/_project/pipeline/42';
const defaultChatId = process.env.TELEGRAM_CHAT_ID;
const defaultCommitId = process.env.DEFAULT_COMMIT_ID || 'default-commit-id';
const defaultEnvironment = process.env.DEFAULT_ENVIRONMENT || 'default-environment';
const defaultProject = process.env.DEFAULT_PROJECT || 'default-project';
const defaultLocale = process.env.DEFAULT_LOCALE || 'en';
const defaultToken = process.env.TELEGRAM_BOT_TOKEN;
const defaultTriggerMessage = process.env.DEFAULT_TRIGGER_MESSAGE ? process.env.DEFAULT_TRIGGER_MESSAGE : true;
const defaultVictim = process.env.DEFAULT_VICTIM || 'default-victim';

module.exports = {
  buildUrl: defaultBuildUrl,
  chatId: defaultChatId,
  commitId: defaultCommitId,
  environment: defaultEnvironment,
  locale: defaultLocale,
  project: defaultProject,
  token: defaultToken,
  triggerMessage: defaultTriggerMessage,
  victim: defaultVictim,
};
