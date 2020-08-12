const dotenv = require("dotenv");
dotenv.config();

const env = process.env;
const conf = {
  workflowFrontendHost: env.WORKFLOW_FRONTEND_HOST || "workflow-frontend:3000",
  workflowProxyHost: env.WORKFLOW_PROXY_HOST || "workflow-proxy:3001",
};

module.exports = conf;
