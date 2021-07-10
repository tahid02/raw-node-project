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
handler.sampleHandler = (requestedProperties, callBack) => {
    callBack(200,{
        message: 'This is  a sample url'
    })
};

//export
module.exports = handler;
