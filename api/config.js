const dotenv = require("dotenv");
dotenv.config();

const env = process.env;
const conf = {
  conductorHost: env.CONDUCTOR_HOST || "conductor:8080",
};

module.exports = conf;
