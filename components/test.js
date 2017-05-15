const express = require('express');
const fs = require('fs');
const path = require('path');
const server = express.Router();

const bot = require('./bot');
const defaults = require('./defaults');

function getEnvironmentTestStatus(env) {
  try {
    const requestedEnv = fs.readFileSync(path.resolve(`./data/test/${env}`)).toString();
    return (requestedEnv === '1');
  } catch(ex) {
    console.log(ex);
    return null;
  }
}

function setEnvironmentTestStatus(env, success) {
  fs.writeFileSync(path.resolve(`./data/test/${env}`), success ? '1' : '0');
}

server.get('/test/status', (req, res, next) => {
  const {query} = req;
  const environment = query.environment;
  res.json(getEnvironmentTestStatus(environment));
});

server.post('/test/succeeded', (req, res, next) => {
  const {body} = req;
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  setEnvironmentTestStatus(environment, true);
  bot.send(`✅ TESTS in \`${environment}\` have *PASSED* (🙏🏽 \`${victim}\`) : COMMIT ID: \`${commitId}\` ✅`);
  res.send('ok');
});

server.post('/test/failed', (req, res, next) => {
  const {body} = req;
  console.log(body);
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  setEnvironmentTestStatus(environment, false);
  bot.send(`❌ TESTS in \`${environment}\` have *FAILED* (👉🏽 \`${victim}\`) : COMMIT ID: \`${commitId}\` ❌`);
  res.send('ok');
});

module.exports = {
  getEnvironmentTestStatus,
  setEnvironmentTestStatus,
  server
};