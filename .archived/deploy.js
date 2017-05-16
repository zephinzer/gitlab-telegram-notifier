const express = require('express');
const fs = require('fs');
const path = require('path');
const server = express.Router();

const bot = require('./bot');
const defaults = require('./defaults');
const utility = require('./utility');

function getEnvironmentDeployStatus(project, env) {
  try {
    const requestedEnv = fs.readFileSync(path.resolve(`./data/${project}/deploy/${env}`)).toString();
    return (requestedEnv === '1');
  } catch(ex) {
    console.log(ex);
    return null;
  }
}

function setEnvironmentDeployStatus(project, env, success) {
  try { fs.mkdirSync(path.resolve(`./data/${project}`)); } catch(ex) { }
  try { fs.mkdirSync(path.resolve(`./data/${project}/test`)); } catch(ex) { }
  fs.writeFileSync(path.resolve(`./data/${project}/deploy/${env}`), success ? '1' : '0');
}

server.get('/deploy/status', (req, res, next) => {
  const { environment, project } = utility.parseUniversalGetArguments(req.query);
  res.json(getEnvironmentDeployStatus(project, environment));
});

server.post('/deploy/succeeded', (req, res, next) => {
  const { buildUrl, commitId, environment, project, triggerMessage, victim } = utility.parseUniversalPostArguments(req.body);
  setEnvironmentDeployStatus(project, environment, true);
  if(triggerMessage) {
    bot.send(`✅ DEPLOYMENT of \`${environment}\` for \`${project}\` has *PASSED* (🙏🏽 \`${victim}\`) : COMMIT ID : \`${commitId}\` ✅`);
  }
  res.send('ok');
});

server.post('/deploy/failed', (req, res, next) => {
  const { buildUrl, commitId, environment, project, triggerMessage, victim } = utility.parseUniversalPostArguments(req.body);
  setEnvironmentDeployStatus(project, environment, false);
  if(triggerMessage) {
    bot.send(`❌ DEPLOYMENT of \`${environment}\` for \`${project}\` has *FAILED* (👉🏽 \`${victim}\`) : COMMIT ID : \`${commitId}\` \n\n Link: \[${buildUrl}\](${buildUrl}) ❌`);
  }
  res.send('ok');
});

module.exports = {
  getEnvironmentDeployStatus,
  setEnvironmentDeployStatus,
  server
};