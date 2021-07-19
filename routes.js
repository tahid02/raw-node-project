/* 
    title: uptime monitoring application
    description: routes and their links
    author: tanzim tahid
    date: 
*/

// dependencies
const { sampleHandler } = require("./hendlers/routeHandlers/sampleHandler");
const { userHandler } = require("./hendlers/routeHandlers/userHandler");
//module scaffolding
const routes = {
  sample: sampleHandler,
  user: userHandler,
};

//export
module.exports = routes;
