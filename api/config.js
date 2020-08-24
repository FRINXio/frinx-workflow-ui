const dotenv = require("dotenv");
dotenv.config();

const env = process.env;
const conf = {
  conductorHost: env.CONDUCTOR_HOST || "conductor-server:8080/api/",
};

module.exports = conf;
