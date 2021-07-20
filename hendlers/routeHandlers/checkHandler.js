/* 
    title: uptime monitoring application
    description: handle 'check'  route
    author: tanzim tahid
    date: 
*/

// dependencies
const { parseJSON } = require("../../helpers/utilities");
const utilities = require("../../helpers/utilities");
const data = require("../../lib/data");
const tokenHandler = require("./tokenHandler");
//module scaffolding
const handler = {};
// main part
handler.checkHandler = (requestedProperties, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.includes(requestedProperties.method)) {
    handler._check[requestedProperties.method](requestedProperties, callback); // calling the requested method's function
  } else {
    callBack(405, {
      // if we don't want to give access > status code > 405
      message: "method is not okay",
    });
  }
};

handler._check = {}; // we are doing another scaffolding (_check) in handle. '_' in check> means we just want some privacy here. This is just convention

handler._check.post = (requestedProperties, callback) => {
  // we will take this inputs(protocol, url, method, timeoutSeconds, successCode) from client(client want the url and its method, protocol etc to store in server).. at first , we are validating them
  const protocol =
    typeof requestedProperties.body.protocol === "string" &&
    ["http", "https"].includes(requestedProperties.body.protocol) // if value of protocol property is http or https
      ? requestedProperties.body.protocol
      : false;

  const url =
    typeof requestedProperties.body.url === "string" &&
    requestedProperties.body.url.trim().length // if length of the provided url is greater than 0
      ? requestedProperties.body.url
      : false;

  const method =
    typeof requestedProperties.body.method === "string" &&
    ["get", "post", "put", "delete"].includes(requestedProperties.body.method) // if value of method property is get or post or put or delete
      ? requestedProperties.body.method
      : false;

  const successCode = // user will send an array of successCode > like> [200,300 ]
    typeof requestedProperties.body.successCode === "object" && // type of array is object
    requestedProperties.body.successCode instanceof Array // returns true if array
      ? requestedProperties.body.successCode
      : false;

  const timeoutSecond = // user will send , how much time to wait to check an url
    typeof requestedProperties.body.url === "number" &&
    requestedProperties.body.timeoutSecond % 1 === 0; // modules
  requestedProperties.body.timeoutSecond <= 5 // we will wait for 5 seconds
    ? requestedProperties.body.timeoutSecond
    : false;

  if (protocol && url && method && successCode && timeoutSecond) {
    typeof requestProperties.headersObject.token === "string"
      ? requestProperties.headersObject.token
      : false;

    // lookup the user phone by reading the token
    data.read("tokens", token, (err1, tokenData) => {
      if (!err1 && tokenData) {
        const userPhone = parseJSON(tokenData).phoneNumber;
        // lookup the user data
        data.read("users", userPhone, (err2, userData) => {
          if (!err2 && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                const userObject = parseJSON(userData);
                const userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array // in users folder , every user has a property ,named checks. Which value is an array
                    ? userObject.checks
                    : [];

                if (userChecks.length < maxChecks) {
                  const checkId = createRandomString(20);
                  const checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };
                  // save the object
                  data.create("checks", checkId, checkObject, (err3) => {
                    if (!err3) {
                      // add check id to the user's object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      // save the new user data
                      data.update("users", userPhone, userObject, (err4) => {
                        if (!err4) {
                          // return the data about the new check
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: "There was a problem in the server side!",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: "There was a problem in the server side!",
                      });
                    }
                  });
                } else {
                  callback(401, {
                    error: "Userhas already reached max check limit!",
                  });
                }
              } else {
                callback(403, {
                  error: "Authentication problem!",
                });
              }
            });
          } else {
            callback(403, {
              error: "User not found!",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication problem!",
        });
      }
    });
  } else {
    callback(200, {
      error: "data not valid",
    });
  }
};

//  when user request in get method , we are providing his checked Data
handler._check.get = (requestProperties, callback) => {
  // client will send an ID of the check , he want to get...
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // lookup the check
    data.read("checks", id, (err, checkData) => {
      // if checks has a file named after this id .. then
      if (!err && checkData) {
        const token = // checking if provided token by client matches our requirements
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone, // we have to parse checkData , as we got this as JSON object
          (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, parseJSON(checkData));
            } else {
              callback(403, {
                error: "Authentication failure!",
              });
            }
          }
        );
      } else {
        callback(500, {
          error: "You have a problem in your request",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};

// if user want to update his check file object

handler._check.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  // validate inputs
  const protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  const url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  const timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read("checks", id, (err1, checkData) => {
        if (!err1 && checkData) {
          const checkObject = parseJSON(checkData);
          const token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;

          tokenHandler._token.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                // user may wanted to update protocol or url or at least any property of the checkObject object
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkObject.timeoutSeconds = timeoutSeconds;
                }
                // store the checkObject
                data.update("checks", id, checkObject, (err2) => {
                  if (!err2) {
                    callback(200);
                  } else {
                    callback(500, {
                      error: "There was a server side error!",
                    });
                  }
                });
              } else {
                callback(403, {
                  error: "Authentication error!",
                });
              }
            }
          );
        } else {
          callback(500, {
            error: "There was a problem in the server side!",
          });
        }
      });
    } else {
      callback(400, {
        error: "You must provide at least one field to update!",
      });
    }
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};

// if client wants to delete his checks > we will delete from users>checks array and from checks folder
handler._check.delete = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // lookup the check
    data.read("checks", id, (err1, checkData) => {
      if (!err1 && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              // delete the check data
              data.delete("checks", id, (err2) => {
                if (!err2) {
                  data.read(
                    "users",
                    parseJSON(checkData).userPhone,
                    (err3, userData) => {
                      const userObject = parseJSON(userData);
                      if (!err3 && userData) {
                        const userChecks =
                          typeof userObject.checks === "object" &&
                          userObject.checks instanceof Array
                            ? userObject.checks
                            : [];

                        // remove the deleted check id from user's list of checks
                        const checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          // resave the user data
                          userObject.checks = userChecks;
                          data.update(
                            "users",
                            userObject.phoneNumber,
                            userObject,
                            (err4) => {
                              if (!err4) {
                                callback(200);
                              } else {
                                callback(500, {
                                  error: "There was a server side problem!",
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            error:
                              "The check id that you are trying to remove is not found in user!",
                          });
                        }
                      } else {
                        callback(500, {
                          error: "There was a server side problem!",
                        });
                      }
                    }
                  );
                } else {
                  callback(500, {
                    error: "There was a server side problem!",
                  });
                }
              });
            } else {
              callback(403, {
                error: "Authentication failure!",
              });
            }
          }
        );
      } else {
        callback(500, {
          error: "You have a problem in your request",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};
//export
module.exports = handler;
