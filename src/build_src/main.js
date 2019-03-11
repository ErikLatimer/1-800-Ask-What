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
var ACCEPTABLE_FIRST_WORD_INPUTS = ["Near", "Budget", "Allergies"];
var PORT_FOR_NGRUNK = 80;

var request = require('request');

var GOOGLEAPIKEY = "AIzaSyDGlozqJfn3b72pTYegNZYKQlCZcLF-hE0";
var KEYSENUM = {
  phoneNumber: 'phoneNumber',
  radius: 'radius',
  budget: 'budget',
  allergies: 'allergies',
  sessionState: 'sessionState'
};
var MAPITERABLE = [[KEYSENUM.phoneNumber, 'phone_Number'], [KEYSENUM.radius, 'radius'], [KEYSENUM.budget, 'budget'], [KEYSENUM.allergies, 'allerrgies'], [KEYSENUM.sessionState, 'sessionState']];
var DOCUMENTKEYSMAP = new Map(MAPITERABLE);
var SESSIONSTATEENUM = {
  unregistered: 'undefined',
  mainMenu: 'mainMenu',
  settingPreferences: 'settingPreferences'
};
var ACTIONENUM = {
  setPreferences: 'preferences',
  getLocationsOfFood: "I'm Hungry"
  /**
   * We will give each stage of the interaction a string, so we know where we are with each user. 
   * When the final payload has been delivered, we will irridicate the interaction to make room for more.
   */

};
app.post('/geolocationLanding', function (request, response) {
  //var longitude = request.query.longitude;
  //var latitude = request.query.latitude;
  console.log("IT REDIRECTED TO LANDING");
  console.log(request.url);
  console.log(request.query.latitude);
  console.log(request.query.longitude);
  console.log(request.query.userNumber);
  var number = request.query.userNumber.substring(1); //MongoGetDataMap(number)
  //session.set(userPhoneNumber, 3);
}); // Maybe event based that triggers another function that texts the user through Twilio's API and says 
// your all set here you go. Just text us that your hungry anytime and we gotchu.

app.get('/geolocation', function (request, response) {
  // If the geolocation object underneath the navigator object is available
  // Make sure you store the geolocation information in the database.
  // NOT AN SMS SETTING.
  var userPhoneNumber = request.query.userNumber; //response.send("Hello");

  console.log(userPhoneNumber);
  var html_path = path.join(__dirname + '/geolocation.html'); // This helps constructs the document/html file to send, by appending
  // cookies to the file about to be sent for display.

  response.cookie("username", userPhoneNumber);
  response.sendFile(html_path);
});
app.get('/', function (request, response) {
  // Twillio Request Objects are already in JSON Object format, NOT strings.
  test(request); ///*

  var userTextMessage = request.query.Body;
  var userPhoneNumber = request.query.From.substring(1); // All the substring(1) does is takes out the plus within the number 
  // that comes from the Twillio request. The full user's number without
  // the "+" symbol  is whats sotred within the Mongo Database.
  // Request state of userPhoneNumber

  var userState = retrieveSessionState(userPhoneNumber);

  switch (userState) {
    case SESSIONSTATEENUM.unregistered:
      var userInformation = new Map();
      userInformation.set(DOCUMENTKEYSMAP.get(KEYSENUM.phoneNumber), userPhoneNumber);
      userInformation.set(DOCUMENTKEYSMAP.get(KEYSENUM.sessionState), SESSIONSTATEENUM.mainMenu);
      mongoStoreDataMap(userInformation, true);
      var twimlObject = new responseTwiml();
      twimlObject.message("Hi! Haven't seen you around here before! Tell me what you like! Here's how I can understand, respond to me just like this:");
      twimlObject.message("\n[Near] How close would you like to be?(ie. 5 mi)\n\n[Budget] How much do you want to spend?(ie. $8)\n\n[Allergies] Do you have any allergies I should know about?(ie. peanuts)");
      response.writeHead(200, {
        'Content-Type': 'text/xml'
      });
      response.end(twimlObject.toString());
      console.log(twimlObject.toString());
      break;

    case SESSIONSTATEENUM.mainMenu:
      // During the mainMenu state, the user has access to a variety of different actions, that are services,
      // such as changing preferences, or getting the locations of something to eat.
      switch (userTextMessage) {
        case ACTIONENUM.setPreferences:
          var _userInformation = new Map();

          var _twimlObject = new responseTwiml();

          var list_of_acceptable_settings = new _stringBuilder.default();

          _userInformation.set(DOCUMENTKEYSMAP.get(KEYSENUM.phoneNumber), userPhoneNumber);

          _userInformation.set(DOCUMENTKEYSMAP.get(KEYSENUM.sessionState), SESSIONSTATEENUM.settingPreferences);

          mongoStoreDataMap(_userInformation, false);

          for (var first_word = 0; first_word < ACCEPTABLE_FIRST_WORD_INPUTS.length; ++first_word) {
            list_of_acceptable_settings.append("".concat(ACCEPTABLE_FIRST_WORD_INPUTS[first_word]));

            if (first_word != ACCEPTABLE_FIRST_WORD_INPUTS.length - 1) {
              list_of_acceptable_settings.append(',');
            }
          }

          _twimlObject.message("Awesome, lets get you customized. The available options are: ".concat(list_of_acceptable_settings.toString(), "\n                        \nText one, all, or a combination of these settings with the word for the available option first, then                         the value of it afterwards. Make sure to put each setting on their own line!"));

          response.writeHead(200, {
            'Content-Type': 'text/xml'
          });
          response.end(_twimlObject.toString());
          console.log(_twimlObject.toString());
          break;

        case ACTIONENUM.getLocationsOfFood: // Here we will retreive the names of resteraunts based on the preferences of the user.
        // We will need a location for the user, so we will handle part of that here.

      }

      break;

    case SESSIONSTATEENUM.settingPreferences:
      // If the user did not enter valid FIRST WORD identifiers for their settings 
      if (!isGoodInput(userText)) {
        var _twimlObject2 = new responseTwiml();

        _twimlObject2.message("Hey I didn't understand one of your preferences, could you repeat yourself a little differently please?");

        response.writeHead(200, {
          'Content-Type': 'text/xml'
        });
        response.end(_twimlObject2.toString());
        console.log(_twimlObject2.toString());
      } // If they did enter valid first word identifiers, then update their dcoument with the data 
      // that's after the identifier for each line.
      else {
          var _userInformation2 = extractDataFromUserText(userText);

          _userInformation2.set(DOCUMENTKEYSMAP.get(KEYSENUM.phoneNumber), userPhoneNumber);

          _userInformation2.set(DOCUMENTKEYSMAP.get(KEYSENUM.sessionState), SESSIONSTATEENUM.mainMenu);

          mongoStoreDataMap(_userInformation2, false);

          var _twimlObject3 = new responseTwiml();

          _twimlObject3.message("Understood! Your preferences have been updated!");

          response.writeHead(200, {
            'Content-Type': 'text/xml'
          });
          response.end(_twimlObject3.toString());
          console.log(_twimlObject3.toString());
        }

      break;
  }

  if (!isGoodInput(userText)) {
    if (session.get(userPhoneNumber) < 1) {
      session.set(userPhoneNumber, 1);

      var _twimlObject4 = new responseTwiml();

      _twimlObject4.message("Hi! Haven't seen you around here before! Tell me what you like! Here's how I can understand, respond to me just like this:");

      _twimlObject4.message("\n[Near] How close would you like to be?(ie. 5 mi)\n\n[Budget] How much do you want to spend?(ie. $8)\n\n[Allergies] Do you have any allergies I should know about?(ie. peanuts)");

      response.writeHead(200, {
        'Content-Type': 'text/xml'
      });
      response.end(_twimlObject4.toString());
      console.log(_twimlObject4.toString());
      return;
    } else if (session.get(userPhoneNumber) < 2) {
      // Else you know what your typing is wrong.
      var _twimlObject5 = new responseTwiml();

      _twimlObject5.message("Hey I didn't understand something that you said, could you repeat yourself please?");

      response.writeHead(200, {
        'Content-Type': 'text/xml'
      });
      response.end(_twimlObject5.toString());
      console.log(_twimlObject5.toString());
      return;
    }
  } else {
    var value_map = extractDataFromUserText(userText);
    value_map.set('Phone_Number', userPhoneNumber);
    mongoStoreDataMap(value_map);
  } // After good input prompt for geolocation, only once though?
  //session.set(userPhoneNumber, 3);


  var sb = new _stringBuilder.default();
  sb.append('<?xml version="1.0" encoding="UTF-8"?>');
  sb.append('<Response>');
  sb.append("<Message>Where are you around?</Message>");
  sb.append("<Message>https://213874d6.ngrok.io/geolocation/?userNumber=".concat(userPhoneNumber, "</Message>"));
  sb.append('</Response>');
  response.writeHead(200, {
    'Content-Type': 'text/xml'
  });
  response.end(sb.toString());
  console.log(sb.toString());
  return; //THE RESPONSE ENDED YOU CAN'T SEND ANY MORE.
  //*/

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

function retrieveSessionState(userCellPhoneNumber) {
  var userInformation = mongoGetDataMap(userCellPhoneNumber);

  if (typeof userInformation == 'undefined') {
    console.log("The first document with Phone_Number value \"".concat(userCellPhoneNumber, "\" does not exist."));
    return SESSIONSTATEENUM.unregistered;
  } else {
    return userInformation.sessionState;
  }
}
/**
 * 
 * @param {} userCellPhone 
 * 
 * Retrieves the first document who's 'Phone_Number' member matches value
 * value with the parameter. Returns this document.
 * 
 * 
 */


function mongoGetDataMap(_x) {
  return _mongoGetDataMap.apply(this, arguments);
}
/**
 * 
 * @param {*} userInformationMap 
 * @param {*} createIfNotFound 
 * 
 * Creates new document or updates existing document the map object provided. Search for exisiting document
 * is first found and is based on string phonenumber, 1 included no plus sign. For example:
 * "12028025136".
 * 
 */


function _mongoGetDataMap() {
  _mongoGetDataMap = _asyncToGenerator(
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

              var DB = client.db(DB_NAME);
              var COLLECTION = DB.collection(COLLECTION_NAME);
              COLLECTION.findOne({
                'Phone_Number': userCellPhone
              }, function (error, result) {
                if (error) {
                  console.error(error);
                  return;
                }

                return result;
              });
            });

          case 6:
            _context2.next = 12;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](3);
            console.error("ERROR WITHIN [connectToPostGres()], CLIENT USER:\"".concat(client.user, "\", PASSWORD:\"").concat(client.password, "\", DATABASE:\"").concat(client.database, "\", HOST:\"").concat(client.host, "\", PORT:\"").concat(client.port, "\" COULD NOT CONNECT. RETURNING..."));
            return _context2.abrupt("return", false);

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[3, 8]]);
  }));
  return _mongoGetDataMap.apply(this, arguments);
}

function mongoStoreDataMap(_x2, _x3) {
  return _mongoStoreDataMap.apply(this, arguments);
}

function _mongoStoreDataMap() {
  _mongoStoreDataMap = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(userInformationMap, createIfNotFound) {
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
                'Phone_Number': userInformationMap.get('Phone_Number')
              }, {
                $set: json_object
              }, {
                upsert: createIfNotFound
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
  return _mongoStoreDataMap.apply(this, arguments);
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
 * 
 * @param {*} userText
 * 
 * Checks to see if the user entered valid FIRST WORD identifiers at the beginning of each line of
 * a sms text message according to the const array of strings ACCEPTABLE_FIRST_WORD_INPUTS.
 */


function isGoodInput(userText) {
  /**
   * The user input should look like this:
   * Near 5 miles
   * Budget $25
   * Allergies peanuts
   */
  // ALL OF THESE ARE STRINGS
  var FIRSTWORD = 0;
  var first_words = [];
  var lines = userText.split("\n"); // For each line

  for (var line = 0; line < lines.length; ++line) {
    var words = lines[line].split(" ");
    first_words.push(words[FIRSTWORD]);
    var passed_checked = false;

    for (var j = 0; j < ACCEPTABLE_FIRST_WORD_INPUTS.length; ++j) {
      if (words[FIRSTWORD] == ACCEPTABLE_FIRST_WORD_INPUTS[j]) {
        passed_checked = true;
      }
    }

    if (!passed_checked) {
      console.log("From passed checks");
      console.log("Failed Input");
      return false;
    }
  } // Making sure out of all the first words in each line, none of them repeat each other.


  for (var firstword = 0; firstword < first_words.length; ++firstword) {
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
/**
 * 
 * @param {*} userText 
 * 
 * Make sure that the parameter or input for this function has already been checked for validity, because
 * this function does not check or regard validity. It blindly assumes all inputs are valid and stores
 * them immediately.
 * 
 * The function extracts the first word of a line within the text message, and uses that as the key
 * for the map, and stores whatever is after the first word ( excluding the first space ) as the value
 * for that key within the map. Returns a map object.
 * 
 * 
 * 
 */


function extractDataFromUserText(userText) {
  // ALL OF THESE VALUES GET SRORED AS A STRING.
  // THE KEYS TO THE DOCUMENTS DONT APPEAR TO BE TRANSLATED AS STRINGS.
  var local_map = new Map();
  var userLines = userText.split("\n");
  var key;
  var value;
  var words;
  var currentLine;
  var FIRST_WORD = 0; // This is gonna loop through all of the user input.

  for (var userLine = 0; userLine < userLines.length; ++userLine) {
    /**
     * We already, or should have already have confirmed that each first word within the line is valid, so all we have to 
     * do is take the first word, store as a key witin the map, and then take whatevers after the
     * space from the first word and store that as the value for the key within the new map.
     */
    currentLine = userLines[userLine];
    words = currentLine.split(" ");
    key = words[FIRST_WORD];
    console.log("Key: \"".concat(key, "\""));
    /**
     * Get the rest of the line. We add the +1 to exclude the first space after the first word when storing the
     * rest of the string as the value in the map.
     */

    console.log(currentLine.indexOf(words[FIRST_WORD]) + words[FIRST_WORD].length + 1);
    value = currentLine.substring(currentLine.indexOf(words[FIRST_WORD]) + words[FIRST_WORD].length + 1);
    console.log("Value: \"".concat(value, "\""));
    local_map.set(key, value);
  }

  return local_map;
}
/**
 * This is just a test function to test smaller pieces of the program before compining them.
**/


function test(request) {
  if (isGoodInput(request.query.Body)) {
    var dataMap = extractDataFromUserText(request.query.Body);
    console.log(dataMap);
  } else {
    console.log("Bad Input");
  }
}