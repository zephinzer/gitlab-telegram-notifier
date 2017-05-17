const express = require('express');
const fs = require('fs');
const path = require('path');
const server = express.Router();

const bot = require('./bot');
const defaults = require('./defaults');

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
  fs.writeFileSync(path.resolve(`./data/${project}/build/${env}`), success ? '1' : '0');
}

server.get('/build/status', (req, res, next) => {
  const {query} = req;
  const environment = query.environment;
  res.json(getEnvironmentBuildStatus(environment));
});

server.post('/build/succeeded', (req, res, next) => {
  const {body} = req;
  const project = body.project || defaults.project;
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  const triggerMessage = true && (body.message !== '0');
  setEnvironmentBuildStatus(project, environment, true);
  if(triggerMessage) {
    bot.send(`✅ BUILD in \`${environment}\` for \`${project}\` has *PASSED* (🙏🏽 ${victim}) : COMMIT ID: \`${commitId}\` ✅`);
  }
  res.send('ok');
});

server.post('/build/failed', (req, res, next) => {
  const {body} = req;
  const project = body.project || defaults.project;
  const environment = body.environment || defaults.environment;
  const victim = body.victim || defaults.victim;
  const commitId = body.commit_id || defaults.commitId;
  const triggerMessage = true && (body.message !== '0');
  setEnvironmentBuildStatus(project, environment, false);
  if(triggerMessage) {
    bot.send(`❌ BUILD in \`${environment}\` for \`${project}\` has *FAILED* (👉🏽 ${victim}) : COMMIT ID: \`${commitId}\` ❌`);
  }
  res.send('ok');
});

module.exports = {
  getEnvironmentBuildStatus,
  setEnvironmentBuildStatus,
  server
};