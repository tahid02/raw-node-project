/* 
    title: uptime monitoring application
    description: utilities are here >> small functions which will be use frequently
    author: tanzim tahid
    date: 
*/

// dependencies
const crypto = require("crypto");
//module scaffolding
const utilities = {};
// main part
utilities.parseJSON = (JSONstring) => {
  //we are not sure that , users are sending valid data .. so , we shouldn't directly parse them..
  let output = {};
  try {
    output = JSON.parse(JSONstring);
  } catch (error) {
    output = {};
  }
  return output;
};

// hashing provided string
utilities.hash = (pass) => {
  if (typeof pass === "string" && pass.length) {
    const hash = crypto
      .createHmac("sha256", "fromEnv")
      .update(pass)
      .digest("hex");
    return hash;
  }
  return false;
};

//export
module.exports = utilities;
