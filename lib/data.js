/* 
    title: uptime monitoring application
    description: creating a library to handle file system data
    author: tanzim tahid
    date: 
*/

// dependencies
const { info } = require("console");
const fs = require("fs");
const path = require("path");

//module scaffolding
const lib = {};

// main part
lib.create = (folderName, fileName, writeData, callback) => {
  console.log(lib.basedir);

  lib.basedir = path.join(__dirname, `../.data/${folderName}/${fileName}.json`); // selecting the path and file to create file

  fs.open(lib.basedir, "wx", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      console.log({ fileDescriptor });
      const stringedData = JSON.stringify(writeData);

      fs.writeFile(fileDescriptor, stringedData, (err1) => {
        if (!err1) {
          // console.log({ fileDescriptor });
          fs.close(fileDescriptor, (err2) => {
            if (!err2) {
              callback(false);
            } else {
              callback("error in closing new file", err2);
            }
          });
        } else {
          callback("error in writing file", err1);
        }
      });
    } else {
      callback("error in opening file", err);
    }
  });
};

lib.create(
  "token",
  "sjsjsjsjsjsjsjsjsjsj",
  { age: 20 },
  (manualErr, runError) => {
    console.log({ manualErr, runError });
  }
);

// read from file system
lib.read = (folderName, readFile, readCallback) => {
  fs.readFile(
    path.join(__dirname, `../.data/${folderName}/${readFile}.json`),
    "utf8",
    (err, readData) => {
      readCallback(err, readData);
    }
  );
};

lib.read("info", "data", (err, readData) => {
  if (err) {
    console.log(err);
  } else {
    console.log(readData);
  }
});

// update file

lib.update = (updateFolderName, updateFileName, updateData, updateCallback) => {
  const updatePath = path.join(
    __dirname,
    `../.data/${updateFolderName}/${updateFileName}.json`
  );
  fs.open(updatePath, "r+", (err, updateFIleDescriptor) => {
    if (!err && updateFIleDescriptor) {
      const stringyFy = JSON.stringify(updateData);
      fs.ftruncate(updateFIleDescriptor, (err1) => {
        if (!err1) {
          fs.writeFile(updateFIleDescriptor, stringyFy, (err2) => {
            if (!err2) {
              fs.close(updateFIleDescriptor, (err3) => {
                if (!err3) {
                  updateCallback("no error");
                } else {
                  updateCallback("error in closing");
                }
              });
            } else {
              updateCallback("error in writing file");
            }
          });
        } else {
          updateCallback("error in truncate");
        }
      });
    } else {
      console.log({ err });
      updateCallback("could not open file");
    }
  });
};

lib.update(
  "info",
  "data",
  { name: "harry", email: "harry@gmail.com" },
  (error) => {
    console.log({ error });
  }
);

/////// delete file from system
lib.delete = (deleteFolderName, deleteFileName, deleteCallback) => {
  const deletePath = path.join(
    __dirname,
    `../.data/${deleteFolderName}/${deleteFileName}.json`
  );
  fs.unlink(deletePath, (err) => {
    if (err) throw { err };
    deleteCallback("delete successful");
  });
};
// calling delete
// lib.delete("info", "file", (deleteStatus) => {
//   console.log({ deleteStatus });
// });
//export module
module.exports = lib;
