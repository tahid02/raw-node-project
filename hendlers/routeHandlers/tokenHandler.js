/* 
    title: uptime monitoring application
    description: handle 'token' route
    author: tanzim tahid
    date: 
*/

// dependencies

//module scaffolding
const handler = {};
// main part
handler.tokenHandler = (requestedProperties, callback) => {
  // checking if requested method is valid
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.includes(requestedProperties.method)) {
    handler._user[requestedProperties.method](requestedProperties, callback); // calling the requested method's function
  } else {
    callBack(405, {
      // if we don't want to give access > status code > 405
      message: "method is not okay",
    });
  }
};
handler._token.post = (requestedProperties, callback) => {};
// handler._token.get = (requestedProperties, callback) => {};
// handler._token.put = (requestedProperties, callback) => {};
// handler._token.delete = (requestedProperties, callback) => {};

//export
module.exports = handler;
