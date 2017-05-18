const bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');
const moment = require('moment');
const os = require('os');
const path = require('path');
const express = require('express');

const bot = require('./components/bot');
const defaults = require('./components/defaults');
const middleware = require('./components/middleware');

const options = {
  polling: true
};

function getSystemInfo() {
  return `\
*System Info*
\`\`\`
Platform  : ${os.platform()} ${os.release()}
Hostname  : ${os.hostname()}
Memory    : ${Math.round(os.totalmem()/1024/1024/1024*100)/100} GB
  Usage   : ${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 10000) / 100}%
Uptime    : ${Math.round(os.uptime()/60/60/24*100)/100} days
\`\`\``;
}

function getProcessInfo() {
  return `\
*Process Info*
\`\`\`
User : ${os.userInfo().username}:${os.userInfo().uid}:${os.userInfo().gid}
PID  : ${process.pid}
CWD  : ${process.cwd()}
\`\`\``;
}

function getChatInfo(chatId) {
  return `\
*Chat Info*
\`\`\`
Chat ID   : ${chatId || defaults.chatId}
\`\`\``;
}

function getAvailableCommands() {
  return `\
*Available Commands*
/help
: lists all commands available

/info
: lists information about this chat

/status {%_ENVIRONMENT_%} {%_PROJECT_%}
: gets the status of the specified environment and project
  : ✅ indicates pass
  : ❌ indicates fail
  : ⁇ indicates unknown

/system
: gets the system information`;
}


const botInstance = bot.getInstance();
const server = express();
server.use(bodyParser.urlencoded({ extended: true }));

botInstance.onText(/\/about/, (msg, match) => {
  const chatId = msg.chat.id;
  const package = require('./package.json');
  bot.send(`
    *DEBUG INFO*
    ${package.name} \`v${package.version}\`
    node-telegram-bot-api \`v${package.dependencies['node-telegram-bot-api']}\`

    *CHAT INFO*
    Chat ID: \`${chatId}\`
    `, {
      parse_mode: 'Markdown'
    }
  );
});

botInstance.onText(/\/help/, (msg, match) => {
  const chatId = msg.chat.id;
  bot.send(getAvailableCommands(), { chatId });
});

botInstance.onText(/\/info/, (msg, match) => {
  const chatId = msg.chat.id;
  bot.send(getChatInfo(chatId), { chatId });
});

botInstance.onText(/\/system/, (msg, match) => {
  const chatId = msg.chat.id;
  bot.send(getSystemInfo(), { chatId });
});

botInstance.onText(/\/status/, (msg, match) => {
  const chatId = msg.chat.id;
  const {text} = msg;
  if(text.split(' ').length === 1) {
    bot.send('Please specify an environment after the /status command!', { chatId });
  }
});

botInstance.onText(/\/status (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1].split(' ');
  let environmentStageListing;
  if(input.length === 1) {
    const project = input[0];
    environmentStageListing = middleware.getEnvironmentStatus(project);
  } else if(input.length > 1) {
    const project = input[0];
    const environment = input[1];
    environmentStageListing = middleware.getEnvironmentStatus(project, environment);
  } else {
    bot.send('Please specify an environment after the /status command!', { chatId });
  }
  let message = '';
  environmentStageListing.environments.forEach(environment => {
    message += `__*${environment}*__\n`;
    for(const stage in environmentStageListing.stages[environment]) {
      const status = environmentStageListing.stages[environment][stage];
      const prefix = status === true ? '✅' : (status === null ? '-' : '❌');
      message += `${prefix} \`${stage}\`\n`
    }
    message += '\n';
  });
  bot.send(message, { chatId });
});

server.use(middleware.server);
server.use('/', (req, res, next) => {
  res.status(200);
  res.send('lol, not\'ng \'ere');
});

http.createServer(server).listen(process.env.PORT_SERVER, err => {
  console.info(`Listening on port ${process.env.PORT_SERVER}`);
  bot.send(
`GitLab Notifier has been initialized at ${moment(new Date()).format('hh:mm A [on] DD MMM YYYY')}
${getSystemInfo()}
${getProcessInfo()}
${getChatInfo()}
${getAvailableCommands()}`);
});

process.on('SIGINT', (code) => {
  bot.send('🔥🔥🔥 GitLab Notifier is DYING 🔥🔥🔥');
  process.exit(code);
});