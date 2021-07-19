/* 
    title: uptime monitoring application
    description: handle 'token' route . this will work like OTP (one time password) for user. so that , user don't need to be authenticated in every requested he do
    author: tanzim tahid
    date: 
*/

// dependencies
const {
  hash,
  parseJSON,
  createRandomString,
} = require("../../helpers/utilities");
const data = require("../../lib/data");
const { token } = require("../../routes");
//module scaffolding
const handler = {};
handler._token = {};
// main part
handler.tokenHandler = (requestedProperties, callback) => {
  // checking if requested method is valid
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.includes(requestedProperties.method)) {
    handler._token[requestedProperties.method](requestedProperties, callback); // calling the requested method's function
  } else {
    callBack(405, {
      // if we don't want to give access > status code > 405
      message: "method is not okay",
    });
  }
};

// when user request in post method( that means when he req for log in .. > we take his data> check if he has signed in > then provide him a token )
handler._token.post = (requestedProperties, callback) => {
  const phoneNumber =
    typeof requestedProperties.body?.phoneNumber === "string" &&
    requestedProperties.body.phoneNumber.trim().length === 11 //if this is true .. then ..
      ? requestedProperties.body.phoneNumber
      : false;

  const password =
    typeof requestedProperties.body?.password === "string" &&
    requestedProperties.body.password.trim().length //if this is true .. then ..
      ? requestedProperties.body.password
      : false;

  if (phoneNumber && password) {
    data.read("users", phoneNumber, (err1, userData) => {
      if (!err1) {
        // user exist
        let hashPassword = hash(password);
        const userDataObj = parseJSON(userData); // how userData has converted from json string to object
        if (hashPassword === userDataObj.password) {
          // now , we will create token for this user
          const tokenID = createRandomString(20); // this will create 20 character's string
          const expires = Date.now() + 60 * 60 * 1000; // this token will expire after one hour
          const tokenObject = {
            // user will get this object for token based authentication
            phoneNumber,
            expires,
            id: tokenID,
          };

          // now we will store this token in token folder
          data.create("token", phoneNumber, (err2) => {
            if (!err2) {
              callback(200, tokenObject); // handleReqRes.js will send  this tokenObject  to the user as response
            } else {
              callback(500, {
                error: "problem with server side",
              });
            }
          });
        }
      } else {
        callback(404, {
          error: "user not found",
        });
      }
    });
  } else {
    callBack(400, {
      error: "provided data is not valid",
    });
  }
};

// user requesting in get method and sent the token in query
handler._token.get = (requestedProperties, callback) => {
  const id =
    typeof requestedProperties.query?.id === "string" &&
    requestedProperties.query.id.trim().length === 20 //if this is true .. then ..
      ? requestedProperties.query.id
      : false;

  data.read("token", id, (err, tokenData) => {
    if (!err && tokenData) {
      // if not error , that means > file is exist( user has signed up before ), so we can provide him data\
      callback(200, token);
    } else {
      callback(404, {
        error: "no token found", // if the id , that user sent in query of get method is not found in .data/token folder
      });
    }
  });
};

// handler._token.put = (requestedProperties, callback) => {};
// handler._token.delete = (requestedProperties, callback) => {};

//export
module.exports = handler;
