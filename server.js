const http = require("http");

const app = require("./app");
const port = process.env.SERVER_PORT;

var httpServer = http.createServer(app);

httpServer.listen(port, '0.0.0.0', () =>
  console.log(`Server started, listening on port ${port}!`)
);
