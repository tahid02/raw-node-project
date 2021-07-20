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
// I manually added a file(sjsjsjssjsj.js) in token from lib> data.js // but user will do this through this post method
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
    callback(400, {
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

// when user req in put method to extend token's expiry time .. in body .. user will send in put method's body> something like this> {id:'randomString',extend:true}
handler._token.put = (requestedProperties, callback) => {
  const id =
    typeof requestedProperties.query?.id === "string" &&
    requestedProperties.query.id.trim().length === 20 //if this is true .. then ..
      ? requestedProperties.query.id
      : false;
  // we know, in put method , while user is requesting ,they  send their data in request body.. user will send a property "extend" in it's body
  const extend =
    typeof requestedProperties.body?.extend === "boolean" &&
    requestedProperties.body.extend === true //if this is true .. then ..
      ? true
      : false;

  if (id && extend) {
    data.read("token", id, (errPut, tokenData) => {
      if (!errPut && tokenData) {
        // this token data is in string .. so we have to parse it before use
        const tokenObject = parseJSON(tokenData);
        if (tokenObject.expires > Date.now()) {
          // tokenObject.expires is  a number and Date.now() also return a number .. so we can compare them
          // it will be true ,  if token is not already expired
          tokenObject.expires = Date.now + 60 * 60 * 1000; // extending one more hour
          // updating this expansion in database
          data.update("token", id, tokenObject, (errUpdate) => {
            if (!errUpdate) {
              callback(200, {
                message: "token expiration time updated successfully",
              });
            } else {
              callback(500, {
                error: "unfortunately couldn't update the token expiry date ",
              });
            }
          });
        } else {
          callback(404, {
            error: "token already expired ",
          });
        }
      } else {
        callback(404, {
          error: "could not read the file. may be there is no such a file ",
        });
      }
    });
  } else {
    callback(400, {
      error: "your provided data is not valid",
    });
  }
};
handler._token.delete = (requestedProperties, callback) => {
  const id =
    typeof requestedProperties.body?.id === "string" &&
    requestedProperties.body.id.trim().length === 20 //if this is true .. then ..
      ? requestedProperties.body.id
      : false;

  if (id) {
    data.read("token", id, (err, tokenDataDelete) => {
      if (!err && tokenDataDelete) {
        data.delete("token", id, (err1) => {
          if (!err1) {
            callback(400, {
              message: "token deletion successful",
            });
          } else {
            callback(400, {
              error: "could not delete the token",
            });
          }
        });
      } else {
        callback(400, {
          error: "token not found",
        });
      }
    });
  } else {
    callback(400, {
      error: "user not found",
    });
  }
};
// verifying token.. this is just a function.. it is not connected with request or response like post, get...
handler._token.verify = (id, phoneNum, callback) => {
  // this callback in parameter is not the callback function, that we got as parameter in tokeHandler() function.. this is completely different one
  data.read("token", id, (err, tokenData) => {
    if (!err && tokenData) {
      const { phoneNumber, expires } = parseJSON(tokenData);
      if (phoneNumber === phoneNum && expires > data.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};
//export
module.exports = handler;
