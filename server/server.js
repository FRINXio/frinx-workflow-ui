const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const proxy = require("express-http-proxy");
const config = require('./config')

const app = express();

app.use(express.static(path.join(__dirname, "dist")));
app.use(bodyParser.urlencoded({ extended: false }));

// proxy API requests to workflow backend
app.all(
  "/api/conductor/*", bodyParser.json(),
  proxy(`http://${config.workflowProxyHost}`, {
    proxyReqPathResolver: (req) => {
      return req.url
    }
  })
);

// serve UI static files
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.NODE_PORT || 3000;
const host = process.env.NODE_HOST || "0.0.0.0";

app.listen(port, host, function () {
  console.log("Server is listening at http://%s:%s", host, port);
  if (process.send) {
    process.send("online");
  }
});
