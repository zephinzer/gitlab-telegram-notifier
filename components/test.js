const express = require('express');
const fs = require('fs');
const path = require('path');
const server = express.Router();

const bot = require('./bot');
const defaults = require('./defaults');

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
  const {query} = req;
  const environment = query.environment;
  res.json(getEnvironmentTestStatus(environment));
});

server.post('/test/succeeded', (req, res, next) => {
  const {body} = req;
  const project = body.project || defaults.project;
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  const triggerMessage = true && (body.message !== '0');
  setEnvironmentTestStatus(project, environment, true);
  if(triggerMessage) {
    bot.send(`✅ TESTS in \`${environment}\` for \`${project}\` have *PASSED* (🙏🏽 \`${victim}\`) : COMMIT ID : \`${commitId}\` ✅`);
  }
  res.send('ok');
});

server.post('/test/failed', (req, res, next) => {
  const {body} = req;
  const project = body.project || defaults.project;
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  const triggerMessage = true && (body.message !== '0');
  setEnvironmentTestStatus(project, environment, false);
  if(triggerMessage) {
    bot.send(`❌ TESTS in \`${environment}\` for \`${project}\` have *FAILED* (👉🏽 \`${victim}\`) : COMMIT ID : \`${commitId}\` ❌`);
  }
  res.send('ok');
});

module.exports = {
  getEnvironmentTestStatus,
  setEnvironmentTestStatus,
  server
};