/* 
    title: uptime monitoring application
    description: handle request and response
    author: tanzim tahid
    date: 
*/

// dependencies
const { StringDecoder } = require("string_decoder");
const routes = require("../routes");
const {
  notFoundHandler,
} = require("../hendlers/routeHandlers/notFoundHandler");
const utilities = require("./utilities");
// const { parseJSON } = require("./utilities");

// const url = require('url');
console.log({ routes });
//handler object - module scaffolding
const handler = {};

// main part
handler.handleReqRes = (req, res) => {
  // handle request
  const parsedURL = new URL(req.url, "http://localhost:8080/");
  // console.log(parsedURL);
  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const query = parsedURL.query;
  const method = req.method.toLowerCase();
  const headerObject = req.headers;

  const decode = new StringDecoder("utf-8"); // creating an object (decode) by providing 'utf-8' as argument in StringDecoder class
  let fullData = "";

  const requestedProperties = {
    parsedURL,
    path,
    trimmedPath,
    query,
    method,
    headerObject,
  };

  const selectedPath = routes[trimmedPath] // suppose trimmedPath is 'sample' , routes.sample , which indicates 'sample' property of routes object
    ? routes[trimmedPath]
    : notFoundHandler;

  req.on("data", (chunk) => {
    // here , we are collecting data from request as chunk . that means , we are collecting the data in a  streaming way and storing every chunk, in fullData variable after decoding the chunk
    fullData += decode.write(chunk); // now , 'decode' object has a method called write() which will take the chunks as argument and decode it as utf-8
  });

  req.on("end", () => {
    // while data collection streaming is done , we are ending decoding. Then calling the function which will provide data to user's requested specific url . Then  sending the response
    fullData += decode.end();
    requestedProperties.body = utilities.parseJSON(fullData); // this parseJSON function is in utilities file

    // suppose selected path is 'sample' , so here we are calling sampleHandler() function below
    selectedPath(requestedProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 500;
      payload = typeof payload === "object" ? payload : {};
      const payloadString = JSON.stringify(payload); // just making the payload as json formate

      // return  response to user
      res.setHeader("Content-Type", "application/json"); // like sending  meta data wile user requesting, server can also send metadata to user while response
      res.writeHead(statusCode);
      res.write(payloadString);
      res.end("your post is complete");
    });
  });
};

// export
module.exports = handler;
