var request = require('request');
var requestFullPath = process.env.CONNECTORBOT_POST_URL;
// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-type': 'application/json'
}

// Configure the request
var options = {
    url: requestFullPath,
    method: 'POST',
    json: true
}

// Start the request
function connectorPost(msg){
  options.form = msg;
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // Print out the response body
      console.log(body)
    }
  })
}



module.exports = {
  post : connectorPost
}
