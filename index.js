var liveServer = require("live-server");

var params = {
  port: 8181,
  host: "0.0.0.0",
  root: "./public",
  open: true,
  file: "index.html",
  wait: 500,
  logLevel: 2,
  middleware: [
    function (req, res, next) {
      next();
    },
  ],
};

liveServer.start(params);
