const express = require('express');
const fs = require('fs');
const path = require('path');
const server = express.Router();

const bot = require('./bot');
const defaults = require('./defaults');
const utility = require('./utility');

function getEnvironmentTestStatus(project, env) {
  try {
    const requestedEnv = fs.readFileSync(path.resolve(`./data/${project}/test/${env}`)).toString();
    return (requestedEnv === '1');
  } catch(ex) {
    console.log(ex);
    return null;
  }
}

function setEnvironmentTestStatus(project, env, success) {
  try { fs.mkdirSync(path.resolve(`./data/${project}`)); } catch(ex) { }
  try { fs.mkdirSync(path.resolve(`./data/${project}/test`)); } catch(ex) { }
  fs.writeFileSync(path.resolve(`./data/${project}/test/${env}`), success ? '1' : '0');
}

server.get('/test/status', (req, res, next) => {
  const { environment, project } = utility.parseUniversalGetArguments(req.query);
  res.json(getEnvironmentTestStatus(project, environment));
});

server.post('/test/succeeded', (req, res, next) => {
  const { buildUrl, commitId, environment, project, triggerMessage, victim } = utility.parseUniversalPostArguments(req.body);
  setEnvironmentTestStatus(project, environment, true);
  if(triggerMessage) {
    bot.send(`✅ TESTS in \`${environment}\` for \`${project}\` have *PASSED* (🙏🏽 \`${victim}\`) : COMMIT ID : \`${commitId}\` ✅`);
  }
  res.send('ok');
});

server.post('/test/failed', (req, res, next) => {
  const { buildUrl, commitId, environment, project, triggerMessage, victim } = utility.parseUniversalPostArguments(req.body);
  setEnvironmentTestStatus(project, environment, false);
  if(triggerMessage) {
    bot.send(`❌ TESTS in \`${environment}\` for \`${project}\` have *FAILED* (👉🏽 \`${victim}\`) : COMMIT ID : \`${commitId}\` \n\n Link: \[${buildUrl}\](${buildUrl}) ❌`);
  }
  res.send('ok');
});

module.exports = {
  getEnvironmentTestStatus,
  setEnvironmentTestStatus,
  server
};