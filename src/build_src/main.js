"use strict";

require("@babel/polyfill");

var _express = _interopRequireDefault(require("express"));

var _stringBuilder = _interopRequireDefault(require("string-builder"));

var _path = require("path");

var _querystring = require("querystring");

var _bodyParser = require("body-parser");

var _url = require("url");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var path = require('path');

var NodeGeocoder = require('node-geocoder');

var MongoClient = require('mongodb').MongoClient;

var responseTwiml = require('twilio').twiml.MessagingResponse;

var app = (0, _express.default)();
var REQUIRED_USER_INFORMATION = ["Near", "Budget", "Allergies"];
var PORT_FOR_NGRUNK = 80;

var request = require('request');

var GOOGLEAPIKEY = "AIzaSyDGlozqJfn3b72pTYegNZYKQlCZcLF-hE0";
/**
 * We will give each stage of the interaction a string, so we know where we are with each user. 
 * When the final payload has been delivered, we will irridicate the interaction to make room for more.
 */

var session = new Map();
app.post('/geolocationLanding', function (request, response) {
  //var longitude = request.query.longitude;
  //var latitude = request.query.latitude;
  console.log("IT REDIRECTED TO LANDING");
  console.log(request.url);
  console.log(request.query.latitude);
  console.log(request.query.longitude);
  console.log(request.query.userPhone); //session.set(userPhoneNumber, 3);
}); // Maybe event based that triggers another function that texts the user through Twilio's API and says 
// your all set here you go. Just text us that your hungry anytime and we gotchu.

app.get('/geolocation', function (request, response) {
  // If the geolocation object underneath the navigator object is available
  // Make sure you store the geolocation information in the database.
  // NOT AN SMS SETTING.
  var userPhoneNumber = request.query.userNumber; //response.send("Hello");

  console.log(userPhoneNumber);
  var html_path = path.join(__dirname + '/geolocation.html'); //response.cookie( "username", userPhoneNumber );

  response.sendFile(html_path);
});
app.get('/', function (request, response) {
  // Twillio Request Objects are already in JSON Object format, NOT strings.
  //test(request);
  var userPhoneNumber = request.query.From.substring(1);
  var userText = request.query.Body; // Will always check for good input.

  if (!isGoodInput(userText)) {
    if (session.get(userPhoneNumber) < 1) {
      session.set(userPhoneNumber, 1);
      var twimlObject = new responseTwiml();
      twimlObject.message("Hi! Haven't seen you around here before! Tell me what you like! Here's how I can understand, respond to me just like this:");
      twimlObject.message("\n[Near] How close would you like to be?(ie. 5 mi)\n\n[Budget] How much do you want to spend?(ie. $8)\n\n[Allergies] Do you have any allergies I should know about?(ie. peanuts)");
      response.writeHead(200, {
        'Content-Type': 'text/xml'
      });
      response.end(twimlObject.toString());
      console.log(twimlObject.toString());
      return;
    } else if (session.get(userPhoneNumber) < 2) {
      // Else you know what your typing is wrong.
      var _twimlObject = new responseTwiml();

      _twimlObject.message("Hey I didn't understand something that you said, could you repeat yourself please?");

      response.writeHead(200, {
        'Content-Type': 'text/xml'
      });
      response.end(_twimlObject.toString());
      console.log(_twimlObject.toString());
      return;
    }
  } else {
    var value_map = extractDataFromUserText(userText);
    MongoStoreDataMap(value_map);
  } // After good input prompt for geolocation, only once though?
  //session.set(userPhoneNumber, 3);


  var sb = new _stringBuilder.default();
  sb.append('<?xml version="1.0" encoding="UTF-8"?>');
  sb.append('<Response>');
  sb.append("<Message>Where are you around?</Message>");
  sb.append("<Message>https://2ff7a32c.ngrok.io/geolocation?userNumber=".concat(userPhoneNumber, "</Message>"));
  sb.append('</Response>');
  response.writeHead(200, {
    'Content-Type': 'text/xml'
  });
  response.end(sb.toString());
  console.log(sb.toString());
  return; //THE RESPONSE ENDED YOU CAN'T SEND ANY MORE.

  /*
  geocoder.geocode(userText, function (error, response) {
      var datamap = MongoGetDataMap(userPhoneNumber);
      var latitude = response[0].latitude;
      var longitude = response[0].longitude
      var google_places_nearby_url =
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude, longitude}&radius=${8000}type=restaurant&opennow=true&key=${GOOGLEAPIKEY}`;
      request(google_places_nearby_url, (error, body, response) => {
          console.log(body);
      });
  });
  */
  // Have them hit the number back
  //Google stuff now.
});
app.get('/retrieveFoodInformation', function (request, response) {// Google maps api goes here and tomato and Z apis go here too.
  // We will retrieve the information from PostGreSQL from here as well. We should have all the information we need by now.
});
app.listen(PORT_FOR_NGRUNK,
/*#__PURE__*/
_asyncToGenerator(
/*#__PURE__*/
regeneratorRuntime.mark(function _callee() {
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("Express is listening on localhost:80");

        case 1:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
})));
/** Async function for connecting to the PostGres service running on the local machine. It is an async function because 
 * we need the promise syntax, and the pause in program execution.
**/

function MongoGetDataMap(_x) {
  return _MongoGetDataMap.apply(this, arguments);
}

function _MongoGetDataMap() {
  _MongoGetDataMap = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(userCellPhone) {
    var URL, DB_NAME, COLLECTION_NAME;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            URL = "mongodb://127.0.0.1:27017";
            DB_NAME = "HackHops";
            COLLECTION_NAME = "UserInformation";
            _context2.prev = 3;
            _context2.next = 6;
            return MongoClient.connect(URL, function (error, client) {
              if (error) {
                console.error("ERROR WITHIN [MongoConnect(callbackfunction)], WITH URL: \"mongodb://127.0.0.1:27017\" .");
                console.error("HERE IS THE ERROR: ".concat(error));
                return;
              }

              var json_object = mapToObj(userInformationMap);
              console.log(json_object);
              var DB = client.db(DB_NAME);
              var COLLECTION = DB.collection(COLLECTION_NAME);
              COLLECTION.findOne({
                "Phone Number": userCellPhone
              }, function (error, response) {
                if (error) {
                  console.error(error);
                  return;
                }

                return response;
              });
            });

          case 6:
            _context2.next = 11;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](3);
            return _context2.abrupt("return", false);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[3, 8]]);
  }));
  return _MongoGetDataMap.apply(this, arguments);
}

function MongoStoreDataMap(_x2) {
  return _MongoStoreDataMap.apply(this, arguments);
}

function _MongoStoreDataMap() {
  _MongoStoreDataMap = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(userInformationMap) {
    var URL, DB_NAME, COLLECTION_NAME;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            URL = "mongodb://127.0.0.1:27017";
            DB_NAME = "HackHops";
            COLLECTION_NAME = "UserInformation";
            _context3.prev = 3;
            _context3.next = 6;
            return MongoClient.connect(URL, function (error, client) {
              if (error) {
                console.error("ERROR WITHIN [MongoConnect(callbackfunction)], WITH URL: \"mongodb://127.0.0.1:27017\" .");
                console.error("HERE IS THE ERROR: ".concat(error));
                return;
              }

              var json_object = mapToObj(userInformationMap);
              console.log(json_object);
              var DB = client.db(DB_NAME);
              var COLLECTION = DB.collection(COLLECTION_NAME);
              COLLECTION.updateOne({
                "Phone Number": userInformationMap.get("Phone Number")
              }, {
                $set: json_object
              }, {
                upsert: true
              }, function (error, document) {
                if (error) {
                  console.error("OHHHH MY GOODDDDDD");
                  console.error(error);
                } else {
                  console.log(document);
                }
              });
            });

          case 6:
            _context3.next = 11;
            break;

          case 8:
            _context3.prev = 8;
            _context3.t0 = _context3["catch"](3);
            return _context3.abrupt("return", false);

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[3, 8]]);
  }));
  return _MongoStoreDataMap.apply(this, arguments);
}

function mapToObj(map) {
  var obj = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = map[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2),
          k = _step$value[0],
          v = _step$value[1];

      obj[k] = v;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return obj;
}
/**
 * The verifyUserInput function is just to verify that the text the user sent is valid, according to the parameters
 * we enforce.
 */


function isGoodInput(userText) {
  /**
   * The user input should look like this:
   * Near 5 miles
   * Budget $25
   * Allergies peanuts
   */
  // ALL OF THESE ARE STRINGS
  var first_words = [];
  var lines = userText.split("\n");

  for (var i = 0; i < lines.length; ++i) {
    var words = lines[i].split(" ");
    first_words.push(words[0]);
    var passed_checked = false;

    for (var j = 0; j < REQUIRED_USER_INFORMATION.length; ++j) {
      if (words[0] == REQUIRED_USER_INFORMATION[j]) {
        passed_checked = true;
      }
    }

    if (!passed_checked) {
      console.log("From passed checks");
      console.log("Failed Input");
      return false;
    }
  }

  for (var k = 0; k < first_words.length; ++k) {
    var previous = first_words.pop();
    console.log("Previous:\"".concat(previous, "\""));
    console.log(first_words);
    console.log(first_words.includes(previous));

    if (first_words.includes(previous)) {
      console.log("repeating offender");
      console.log("Failed Input");
      return false;
    }
  }

  console.log("True Input");
  return true;
}

function extractDataFromUserText(userText) {
  // ALL OF THESE ARE STRING
  var local_map = new Map();
  var userInfoArray = userText.split("\n"); // This is gonna loop through all of the user input.

  for (var userInput = 0; userInput < userInfoArray.length; ++userInput) {
    // Sense we all have a piece of information on each line
    for (var requiredInfo = 0; requiredInfo < REQUIRED_USER_INFORMATION.length; ++requiredInfo) {
      if (userInfoArray[userInput].includes(REQUIRED_USER_INFORMATION[requiredInfo])) {
        var input = userInfoArray[userInput].substring(userInfoArray[userInput].indexOf(REQUIRED_USER_INFORMATION[requiredInfo]) + REQUIRED_USER_INFORMATION[requiredInfo].length);
        local_map.set(REQUIRED_USER_INFORMATION[requiredInfo], input);
      }
    }
  }

  return local_map;
}
/**
 * This is just a test function to test smaller pieces of the program before compining them.
**/


function test(request) {
  if (isGoodInput(request.query.Body)) {
    console.log(extractDataFromUserText(request.query.Body));
    var dataMap = extractDataFromUserText(request.query.Body);
    dataMap.set("Phone Number", request.query.From.substring(1));
    MongoStoreDataMap(dataMap);
  }
}