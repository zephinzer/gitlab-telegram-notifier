const express = require('express');
const fs = require('fs');
const path = require('path');
const server = express.Router();

const bot = require('./bot');
const defaults = require('./defaults');

function getEnvironmentDeployStatus(env) {
  try {
    const requestedEnv = fs.readFileSync(path.resolve(`./data/deploy/${env}`)).toString();
    return (requestedEnv === '1');
  } catch(ex) {
    console.log(ex);
    return null;
  }
}

function setEnvironmentDeployStatus(env, success) {
  fs.writeFileSync(path.resolve(`./data/deploy/${env}`), success ? '1' : '0');
}

server.get('/deploy/status', (req, res, next) => {
  const {query} = req;
  const environment = query.environment;
  res.json(getEnvironmentDeployStatus(environment));
});

server.post('/deploy/succeeded', (req, res, next) => {
  const {body} = req;
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  setEnvironmentDeployStatus(environment, true);
  bot.send(`✅ DEPLOYMENT of \`${environment}\` has *PASSED* (🙏🏽 ${victim}) : COMMIT ID: \`${commitId}\` ✅`);
  res.send('ok');
});

server.post('/deploy/failed', (req, res, next) => {
  const {body} = req;
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  setEnvironmentDeployStatus(environment, false);
  bot.send(`❌ DEPLOYMENT of \`${environment}\` has *FAILED* (👉🏽 ${victim}) : COMMIT ID: \`${commitId}\` ❌`);
  res.send('ok');
});

module.exports = {
  getEnvironmentDeployStatus,
  setEnvironmentDeployStatus,
  server
};