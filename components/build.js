const express = require('express');
const fs = require('fs');
const path = require('path');
const server = express.Router();

const bot = require('./bot');
const defaults = require('./defaults');

function getEnvironmentBuildStatus(env) {
  try {
    const requestedEnv = fs.readFileSync(path.resolve(`./data/build/${env}`)).toString();
    return (requestedEnv === '1');
  } catch(ex) {
    console.log(ex);
    return null;
  }
}

function setEnvironmentBuildStatus(env, success) {
  fs.writeFileSync(path.resolve(`./data/build/${env}`), success ? '1' : '0');
}

server.get('/build/status', (req, res, next) => {
  const {query} = req;
  const environment = query.environment;
  res.json(getEnvironmentBuildStatus(environment));
});

server.post('/build/succeeded', (req, res, next) => {
  const {body} = req;
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  setEnvironmentTestStatus(environment, true);
  bot.send(`✅ BUILD in \`${environment}\` has *PASSED* (🙏🏽 ${victim}) : COMMIT ID: \`${commitId}\` ✅`);
  res.send('ok');
});

server.post('/build/failed', (req, res, next) => {
  const {body} = req;
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  setEnvironmentTestStatus(environment, true);
  bot.send(`❌ BUILD in \`${environment}\` has *FAILED* (👉🏽 ${victim}) : COMMIT ID: \`${commitId}\` ❌`);
  res.send('ok');
});

module.exports = {
  getEnvironmentBuildStatus,
  setEnvironmentBuildStatus,
  server
};