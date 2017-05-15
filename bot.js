const bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');
const moment = require('moment');
const os = require('os');
const path = require('path');
const express = require('express');

const bot = require('./components/bot');
const defaults = require('./components/defaults');
const build = require('./components/build');
const deploy = require('./components/deploy');
const test = require('./components/test');

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

function getChatInfo() {
  return `\
*Chat Info*
\`\`\`
Chat ID   : ${defaults.chatId}
\`\`\``;
}

function getAvailableCommands() {
  return `\
*Available Commands*
/help
: lists all commands available

/info
: lists information about this chat

/status {%_ENVIRONMENT_%}
: gets the status of the specified environment
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
  bot.send(getAvailableCommands());
});

botInstance.onText(/\/info/, (msg, match) => {
  bot.send(getChatInfo());
});

botInstance.onText(/\/system/, (msg, match) => {
  bot.send(getSystemInfo());
});

botInstance.onText(/\/status/, (msg, match) => {
  const {text} = msg;
  if(text.split(' ').length === 1) {
    bot.send('Please specify an environment after the /status command!');
  }
});

botInstance.onText(/\/status (.+)/, (msg, match) => {
  const environment = match[1];
  const testStatus = test.getEnvironmentTestStatus(environment);
  const buildStatus = build.getEnvironmentBuildStatus(environment);
  const deployStatus = deploy.getEnvironmentDeployStatus(environment);
  const testOutput = (() => {switch(testStatus) {
    case true: return '✅';
    case false: return '❌';
    case null: return '⁇';
  }})();
  const buildOutput = (() => {switch(buildStatus) {
    case true: return '✅';
    case false: return '❌';
    case null: return '⁇';
  }})();
  const deployOutput = (() => {switch(deployStatus) {
    case true: return '✅';
    case false: return '❌';
    case null: return '⁇';
  }})();

  bot.send(`\
\`${environment}\`
${testOutput} test
${buildOutput} build
${deployOutput} deploy`);
});

server.use(build.server);
server.use(test.server);
server.use(deploy.server);
server.use('/', (req, res, next) => {
  res.status(200);
  res.bot.send('lol, not\'ng \'ere');
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

process.on('SIGKILL', (code) => {
  bot.send('🔥🔥🔥 GitLab Notifier is DYING 🔥🔥🔥');
  process.exit(code);
});

process.on('SIGINT', (code) => {
  bot.send('🔥🔥🔥 GitLab Notifier is DYING 🔥🔥🔥');
  process.exit(code);
});