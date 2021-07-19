/* 
    title: uptime monitoring application
    description: handle 'user' route
    author: tanzim tahid
    date: 
*/

// dependencies
const { parseJSON } = require("../../helpers/utilities");
const utilities = require("../../helpers/utilities");
const data = require("../../lib/data");
//module scaffolding
const handler = {};
// main part
handler.userHandler = (requestedProperties, callback) => {
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

handler._user = {}; // we are doing another scaffolding (_user) in handle. '_' in user> means we just want some privacy here. This is just convention

// // create user > something like sign up
handler._user.post = (requestedProperties, callback) => {
  // suppose, user is sending their 'firstName',lastName, phoneNumber and accepting the tos
  // now, we are validating their data
  const firstName =
    typeof requestedProperties.body?.firstName === "string" &&
    requestedProperties.body.firstName.trim().length //if this is true .. then ..
      ? requestedProperties.body.firstName
      : false;

  const lastName =
    typeof requestedProperties.body?.lastName === "string" &&
    requestedProperties.body.lastName.trim().length // if this is true .. then ..
      ? requestedProperties.body.lastName
      : false;

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

  const tos = // tos> terms of agreement
    typeof requestedProperties.body?.tos === "boolean" &&
    requestedProperties.body.tos.trim().length //if this is true .. then ..
      ? requestedProperties.body.tos
      : false;

  if (firstName && lastName && password && tos) {
    // now, we will store this user in our server or database if he is not already signed up or exist
    data.read("users", phoneNumber, (err, readData) => {
      if (err) {
        // fs.read will provide error if the file is not exist..  and we want to add the user if he does not exist. so , we need error
        const userObject = {
          firstName,
          lastName,
          phoneNumber,
          tos,
          password: utilities.hash(password),
        };
        data.create("users", phoneNumber, userObject, (err1) => {
          if (err1) {
            callback(500, {
              message: "error in creating a new user",
            });
          } else {
            callback(500, {
              error: "error in creating a new user",
            });
          }
        });
      } else {
        callback(500, {
          error: "server side error",
        });
      }
    });
  } else {
    callback(400, {
      error: "your provided data is not valid",
    });
  }
};

handler._user.get = (requestedProperties, callback) => {
  const phoneNumber =
    typeof requestedProperties.query?.phoneNumber === "string" &&
    requestedProperties.query.phoneNumber.trim().length === 11 //if this is true .. then ..
      ? requestedProperties.query.phoneNumber
      : false;

  data.read("users", phoneNumber, (err, userData) => {
    if (!err && userData) {
      // if not error , that means > file is exist( user has signed up before ), so we can provide him data\
      const copiedUser = { ...parseJSON(userData) };
      if (userData.password === utilities.hash(getPassword)) {
        delete copiedUser?.password; // we shouldn't directly delete property.. rather we should copy and then delete from the copied object
        callback(200, userData); // we won't send password
      } else {
        callback(200, {
          message: "error in sending data",
        });
      }
    } else {
      callback(404, {
        error: "user does not exist",
      });
    }
  });
};

handler._user.patch = (requestedProperties, callback) => {
  const firstName =
    typeof requestedProperties.body?.firstName === "string" &&
    requestedProperties.body.firstName.trim().length //if this is true .. then ..
      ? requestedProperties.body.firstName
      : false;

  const lastName =
    typeof requestedProperties.body?.lastName === "string" &&
    requestedProperties.body.lastName.trim().length // if this is true .. then ..
      ? requestedProperties.body.lastName
      : false;

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

  if (phoneNumber) {
    // if phone is true .. then we can do put method

    if (firstName || lastName || password) {
      // if they pass the validation

      data.read("users", phoneNumber, (err, userDataUpdate) => {
        const copiedUserToUpdate = { ...parseJSON(userDataUpdate) };
        if (!err && userData) {
          if (firstName) {
            copiedUserToUpdate.firstName = firstName;
          }
          if (lastName) {
            copiedUserToUpdate.lastName = lastName;
          }
          if (password) {
            copiedUserToUpdate.password = utilities.hash(password);
          }

          // store to database
          data.update("users", phoneNumber, userData, (errUpdate) => {
            if (!errUpdate) {
              callback(200, {
                message: " user update successful",
              });
            } else {
              callback(500, {
                error: "something went wrong",
              });
            }
          });
        } else {
          callback(404, {
            error: "user not found",
          });
        }
      });
    } else {
      callback(404, {
        error: "user not found",
      });
    }
  }
};

// delete user
handler._user.delete = (requestedProperties, callback) => {
  const phoneNumber =
    typeof requestedProperties.body?.phoneNumber === "string" &&
    requestedProperties.body.phoneNumber.trim().length === 11 //if this is true .. then ..
      ? requestedProperties.body.phoneNumber
      : false;

  if (phoneNumber) {
    data.read("users", phoneNumber, (err, userDataDelete) => {
      if (!err && userDataDelete) {
        data.delete("users", phoneNumber, (err1) => {
          if (!err1) {
            callback(400, {
              message: "user deletion successful",
            });
          } else {
            callback(400, {
              error: "could not delete the user",
            });
          }
        });
      } else {
        callback(400, {
          error: "user not found",
        });
      }
    });
  } else {
    callback(400, {
      error: "user not found",
    });
  }
};
//export
module.exports = handler;
