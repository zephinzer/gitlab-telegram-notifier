const express = require('express');
const fs = require('fs');
const path = require('path');
const server = express.Router();

const bot = require('./bot');
const defaults = require('./defaults');
const utility = require('./utility');

function getEnvironmentStatus(project, env) {
  if(project === undefined) { throw new Error('Project was not defined'); }
  const projectDirectory = path.resolve(`./data/${project}`);
  try { fs.lstatSync(projectDirectory); }
  catch(ex) { fs.mkdirSync(projectDirectory); }
  const environmentsAndStages = {
    environments: [],
    stages: {}
  };
  if(env === undefined) {
    const environmentListings = fs.readdirSync(projectDirectory);
    environmentListings.forEach(environment => {
      environmentsAndStages.environments.push(environment);
      environmentsAndStages.stages[environment] = {};
      const environmentDirectory = path.resolve(`./data/${project}/${environment}`);
      const stageListings = fs.readdirSync(environmentDirectory);
      stageListings.forEach(stage => {
        environmentsAndStages.stages[environment][stage] =
          (fs.readFileSync(path.join(environmentDirectory, `/${stage}`)).toString() === '1');
      });
    });
  } else {
    const environmentDirectory = path.resolve(`./data/${project}/${env}`);
    try { fs.lstatSync(environmentDirectory); }
    catch(ex) { fs.mkdirSync(environmentDirectory); }
    environmentsAndStages.environments.push(env);
    environmentsAndStages.stages[env] = {};
    const stageListings = fs.readdirSync(environmentDirectory);
    stageListings.forEach(stage => {
      environmentsAndStages.stages[env][stage] =
        (fs.readFileSync(path.join(environmentDirectory, `/${stage}`)).toString() === '1');
    });
  }
  return environmentsAndStages;
}

function setEnvironmentStatus(project, env, stage, success) {
  try { fs.mkdirSync(path.resolve(`./data/${project}`)); } catch(ex) { }
  try { fs.mkdirSync(path.resolve(`./data/${project}/${env}`)); } catch(ex) { }
  fs.writeFileSync(path.resolve(`./data/${project}/${env}/${stage}`), success ? '1' : '0');
}

function sendNotification(project, environment, stage, commitId, commitMessage, victim, buildUrl, pass) {
  const prefix = pass ? '✅' : '❌';
  const status = pass ? 'PASSED' : 'FAILED';
  bot.send(`\
${prefix} \`${project}\`:\`${environment}\`:\`${stage.toUpperCase()}\` *${status}*

*\`${victim}\`* \`${commitMessage} [${commitId}]\`

🖇 \[${buildUrl}\](${buildUrl})`);
}

server.get('/:stage/status', (req, res, next) => {
  const {stage} = req.params;
  const { environment, project } = utility.parseUniversalGetArguments(req.query);
  res.json(getEnvironmentStatus(project, environment, stage));
});

server.post('/:stage/succeeded', (req, res, next) => {
  try {
    const {stage} = req.params;
    const { buildUrl, commitMessage, commitId, environment, project, triggerMessage, victim } = utility.parseUniversalPostArguments(req.body);
    setEnvironmentStatus(project, environment, stage, true);
    (triggerMessage) && sendNotification(project, environment, stage, commitId, commitMessage, victim, buildUrl, true);
    res.jsonp('ok');
  } catch(ex) {
    res.json(ex);
  }
});

server.post('/:stage/failed', (req, res, next) => {
  try {
    const {stage} = req.params;
    const { buildUrl, commitMessage, commitId, environment, project, triggerMessage, victim } = utility.parseUniversalPostArguments(req.body);
    setEnvironmentStatus(project, environment, stage, false);
    (triggerMessage) && sendNotification(project, environment, stage, commitId, commitMessage, victim, buildUrl, false);
    res.json('ok');
  } catch(ex) {
    res.json(ex);
  }
});

module.exports = {
  getEnvironmentStatus,
  setEnvironmentStatus,
  server
};
