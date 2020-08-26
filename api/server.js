const express = require("express");
const bodyParser = require("body-parser");
const conductorAPI = require("./routes/conductor");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/conductor", bodyParser.json(), conductorAPI);

const port = process.env.NODE_PORT || 3001;
const host = process.env.NODE_HOST || "0.0.0.0";

app.listen(port, host, function () {
  console.log("Server is listening at http://%s:%s", host, port);
  if (process.send) {
    process.send("online");
  }
});
