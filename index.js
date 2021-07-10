/* 
    title: uptime monitoring application
    description: a restfult api to monitore up or dow time of user defined links
    author: tanzim tahid
    date: 
*/

// dependencies
const http = require("http");
const handler = require("./helpers/handleReqRes");

// const {handleReqRes} = require('./helpers/handleReqRes');

// app Object- module scaffolding
const app = {};

// configuration
app.config = {
  port: 8080,
};

app.createServer = () => {
  const server = http.createServer(app.handleReqRes);

  server.listen(app.config.port, () => {
    console.log("server running at port " + app.config.port + " " + ".....");
  });
};
// handle request response
app.handleReqRes = handler.handleReqRes;
// start the server
app.createServer();
