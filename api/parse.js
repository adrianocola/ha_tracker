var qs = require('querystring');

module.exports = Parse;

function Parse(application_id, rest_key) {
  this._application_id = application_id;
  this._rest_key = rest_key;
}

Parse.prototype = {
  _api_protocol: require('https'),
  _api_host: 'api.parse.com',
  _api_port: 443,

  //**********************
  //******* OBJECTS ******
  //**********************

  // add object to class store
  insertObject: function (className, object, session, callback) {
    parseRequest.call(this, 'POST', '/1/classes/' + className, object, session, callback);
  },
  
  // get objects from class store
  findObject: function (className, query, session ,callback) {
    if (typeof query === 'string') {
      parseRequest.call(this, 'GET', '/1/classes/' + className + '/' + query, null, session, callback);
    } else {
      parseRequest.call(this, 'GET', '/1/classes/' + className, { where: JSON.stringify(query) }, session, callback);
    }
  },
  
  // update an object in the class store
  updateObject: function (className, objectId, object, session, callback) {
    parseRequest.call(this, 'PUT', '/1/classes/' + className + '/' + objectId, object, session, callback);
  },
  
  // remove an object from the class store
  deleteObject: function (className, objectId, session, callback) {
    parseRequest.call(this, 'DELETE', '/1/classes/' + className + '/' + objectId, null, session, callback);
  },



  //**********************
  //******** USERS *******
  //**********************

  createUser: function(username, password, email, data, callback){
      data = data || {};
      data.username = username;
      data.password = password;
      data.email = email;

      parseRequest.call(this, 'POST', '/1/users/', data, null, callback);
  },

  updateUser: function(objectId, data, session, callback){

      parseRequest.call(this, 'PUT', '/1/users/' + objectId, data, session, callback);

  },

  findUser: function(objectId, session, callback){

      parseRequest.call(this, 'GET', '/1/users/' + objectId, null, session, callback);

  },

  login: function(username, password, callback){

      parseRequest.call(this, 'GET', '/1/login/', {username: username, password: password}, null, callback);

  }



};

// Parse.com https api request
function parseRequest(method, path, data, session ,callback) {
  //var auth = 'Basic ' + new Buffer(this._application_id + ':' + this._master_key).toString('base64');
  var headers = {
    //Authorization: auth,
    Connection: 'Keep-alive',
    'X-Parse-Application-Id': this._application_id,
    'X-Parse-REST-API-Key': this._rest_key
  };

  if(session){
    headers['X-Parse-Session-Token'] = session;
  }

  var body = null;
  
  switch (method) {
    case 'GET':
      if (data) {
        path += '?' + qs.stringify(data);
      }
      break;
    case 'POST':
    case 'PUT':
      if(typeof data === 'string') console.log(string);
      body = JSON.stringify(data);
        console.log(data);
      headers['Content-type'] = 'application/json';
      headers['Content-length'] = body.length;
      break;
    case 'DELETE':
      headers['Content-length'] = 0;
      break;
    default:
      throw new Error('Unknown method, "' + method + '"');
  }
  
  var options = {
    host: this._api_host,
    port: this._api_port,
    headers: headers,
    path: path,
    method: method
  };
  
  var req = this._api_protocol.request(options, function (res) {
    if (!callback) {
      return;
    }

    var err = null;
    
    if (res.statusCode < 200 || res.statusCode >= 300) {
      err = new Error('HTTP error ' + res.statusCode);
      err.arguments = arguments;
      err.type = res.statusCode;
      err.options = options;
      err.body = body;
    }
    
    var json = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      json += chunk;
    });
    
    res.on('end', function () {
      var data = null;
      try {
        var data = JSON.parse(json);
      } catch (err) {
      }
      callback(err, data);
    });
    
    res.on('close', function (err) {
      callback(err);
    });
  });
  
  body && req.write(body);
  req.end();

  req.on('error', function (err) {
    callback && callback(err);
  });
}
