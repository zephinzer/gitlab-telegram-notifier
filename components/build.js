const express = require('express');
const fs = require('fs');
const path = require('path');
const server = express.Router();

const bot = require('./bot');
const defaults = require('./defaults');
const utility = require('./utility');

function getEnvironmentBuildStatus(project, env) {
  try {
    const requestedEnv = fs.readFileSync(path.resolve(`./data/${project}/build/${env}`)).toString();
    return (requestedEnv === '1');
  } catch(ex) {
    console.log(ex);
    return null;
  }
}

function setEnvironmentBuildStatus(project,env, success) {
  try { fs.mkdirSync(path.resolve(`./data/${project}`)); } catch(ex) { }
  try { fs.mkdirSync(path.resolve(`./data/${project}/build`)); } catch(ex) { }
  fs.writeFileSync(path.resolve(`./data/${project}/build/${env}`), success ? '1' : '0');
}

server.get('/build/status', (req, res, next) => {
  const { environment, project } = utility.parseUniversalGetArguments(req.query);
  res.json(getEnvironmentBuildStatus(project, environment));
});

server.post('/build/succeeded', (req, res, next) => {
  const { buildUrl, commitId, environment, project, triggerMessage, victim } = utility.parseUniversalPostArguments(req.body);
  setEnvironmentBuildStatus(project, environment, true);
  if(triggerMessage) {
    bot.send(`✅ BUILD in \`${environment}\` for \`${project}\` has *PASSED* (🙏🏽 \`${victim}\`) : COMMIT ID: \`${commitId}\` ✅`);
  }
  res.send('ok');
});

server.post('/build/failed', (req, res, next) => {
  const { buildUrl, commitId, environment, project, triggerMessage, victim } = utility.parseUniversalPostArguments(req.body);
  setEnvironmentBuildStatus(project, environment, false);
  if(triggerMessage) {
    bot.send(`❌ BUILD of \`${environment}\` for \`${project}\` has *FAILED* (👉🏽 \`${victim}\`) : COMMIT ID : \`${commitId}\` \n\n Link: \[${buildUrl}\](${buildUrl}) ❌`);
  }
  res.send('ok');
});

module.exports = {
  getEnvironmentBuildStatus,
  setEnvironmentBuildStatus,
  server
};