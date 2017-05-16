const defaults = require('./defaults');

module.exports = {
  parseUniversalPostArguments: function(requestBody) {
    const buildUrl = requestBody.build_url || defaults.buildUrl;
    const project = requestBody.project || defaults.project;
    const environment = requestBody.environment || defaults.environment;
    const victim = requestBody.victim || defaults.victim;
    const commitMessage = requestBody.commit_message || defaults.commitMessage;
    const commitId = requestBody.commit_id || defaults.commitId;
    const triggerMessage = requestBody.message ? 
      (requestBody.message !== '0') :
      defaults.triggerMessage;
    return {
      buildUrl,
      project,
      environment,
      victim,
      commitMessage,
      commitId,
      triggerMessage
    };
  },
  parseUniversalGetArguments: function(requestQuery) {
    const environment = requestQuery.environment || defaults.environment;
    const project = requestQuery.project || defaults.project;
    return {
      environment, project
    };
  }
};
