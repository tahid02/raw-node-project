/* 
    title: uptime monitoring application
    description: handle 'sample' route
    author: tanzim tahid
    date: 
*/

// dependencies

//module scaffolding
const handler = {};
// main part

handler.notFoundHandler = (requestedProperties, callBack) => {
  callBack(404, {
    message: "This page is not found",
  });
};

//export
module.exports = handler;
