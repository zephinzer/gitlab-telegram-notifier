const express = require('express');
const fs = require('fs');
const path = require('path');
const server = express.Router();

const bot = require('./bot');
const defaults = require('./defaults');

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
  fs.writeFileSync(path.resolve(`./data/${project}/deploy/${env}`), success ? '1' : '0');
}

server.get('/deploy/status', (req, res, next) => {
  const {query} = req;
  const environment = query.environment;
  res.json(getEnvironmentDeployStatus(environment));
});

server.post('/deploy/succeeded', (req, res, next) => {
  const {body} = req;
  const project = body.project || defaults.project;
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  const triggerMessage = true && (body.message !== '0');
  setEnvironmentDeployStatus(project, environment, true);
  if(triggerMessage) {
    bot.send(`✅ DEPLOYMENT of \`${environment}\` for \`${project}\` has *PASSED* (🙏🏽 ${victim}) : COMMIT ID : \`${commitId}\` ✅`);
  }
  res.send('ok');
});

server.post('/deploy/failed', (req, res, next) => {
  const {body} = req;
  const project = body.project || defaults.project;
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  const triggerMessage = true && (body.message !== '0');
  setEnvironmentDeployStatus(project, environment, false);
  if(triggerMessage) {
    bot.send(`❌ DEPLOYMENT of \`${environment}\` for \`${project}\` has *FAILED* (👉🏽 ${victim}) : COMMIT ID : \`${commitId}\` ❌`);
  }
  res.send('ok');
});

module.exports = {
  getEnvironmentDeployStatus,
  setEnvironmentDeployStatus,
  server
};