import '@babel/polyfill';
import express from 'express';
import StringBuilder from 'string-builder';
import { parse } from 'path';
import { stringify } from 'querystring';
import { json } from 'body-parser';
import { Url } from 'url';

const path = require('path');
const NodeGeocoder = require('node-geocoder');

const MongoClient = require('mongodb').MongoClient;
const responseTwiml = require('twilio').twiml.MessagingResponse;

const app = express();

const ACCEPTABLE_FIRST_WORD_INPUTS = ["Near", "Budget", "Allergies"];

const PORT_FOR_NGRUNK = 80;

const request = require('request');

const GOOGLEAPIKEY = "";

const KEYSENUM = {
    phoneNumber: 'phoneNumber',
    radius: 'radius',
    budget: 'budget',
    allergies: 'allergies',
    sessionState: 'sessionState'
};

const MAPITERABLE = [
    [KEYSENUM.phoneNumber, 'phone_Number'],
    [KEYSENUM.radius, 'radius'],
    [KEYSENUM.budget, 'budget'],
    [KEYSENUM.allergies, 'allerrgies'],
    [KEYSENUM.sessionState, 'sessionState']

];

const DOCUMENTKEYSMAP = new Map(MAPITERABLE);

const SESSIONSTATEENUM = {
    unregistered: 'undefined',
    mainMenu: 'mainMenu',
    settingPreferences: 'settingPreferences'
}

const ACTIONENUM = {
    setPreferences: 'preferences',
    getLocationsOfFood: "I'm Hungry"
}


/**
 * We will give each stage of the interaction a string, so we know where we are with each user. 
 * When the final payload has been delivered, we will irridicate the interaction to make room for more.
 */


app.post('/geolocationLanding', (request, response) => {


    //var longitude = request.query.longitude;
    //var latitude = request.query.latitude;

    console.log("IT REDIRECTED TO LANDING");
    console.log(request.url);
    console.log(request.query.latitude);
    console.log(request.query.longitude);
    console.log(request.query.userNumber);
    var number = (request.query.userNumber.substring(1));
    //MongoGetDataMap(number)
    //session.set(userPhoneNumber, 3);
});


// Maybe event based that triggers another function that texts the user through Twilio's API and says 
// your all set here you go. Just text us that your hungry anytime and we gotchu.




app.get('/geolocation', (request, response) => {
    // If the geolocation object underneath the navigator object is available
    // Make sure you store the geolocation information in the database.

    // NOT AN SMS SETTING.

    var userPhoneNumber = request.query.userNumber;
    //response.send("Hello");
    console.log(userPhoneNumber);


    var html_path = (path.join(__dirname + '/geolocation.html'));

    // This helps constructs the document/html file to send, by appending
    // cookies to the file about to be sent for display.
    response.cookie("username", userPhoneNumber);
    response.sendFile(html_path);
});

app.get('/', (request, response) => {
    // Twillio Request Objects are already in JSON Object format, NOT strings.

    test(request);

    ///*


    var userTextMessage = request.query.Body;
    var userPhoneNumber = request.query.From.substring(1);
    // All the substring(1) does is takes out the plus within the number 
    // that comes from the Twillio request. The full user's number without
    // the "+" symbol  is whats sotred within the Mongo Database.

    // Request state of userPhoneNumber
    var userState = retrieveSessionState(userPhoneNumber);
    switch (userState) {
        case SESSIONSTATEENUM.unregistered:
            let userInformation = new Map();
            userInformation.set(DOCUMENTKEYSMAP.get(KEYSENUM.phoneNumber), userPhoneNumber);
            userInformation.set(DOCUMENTKEYSMAP.get(KEYSENUM.sessionState), SESSIONSTATEENUM.mainMenu);
            mongoStoreDataMap(userInformation, true);

            let twimlObject = new responseTwiml();
            twimlObject.message("Hi! Haven't seen you around here before! Tell me what you like! Here's how I can understand, respond to me just like this:");
            twimlObject.message("\n[Near] How close would you like to be?(ie. 5 mi)\n\n[Budget] How much do you want to spend?(ie. $8)\n\n[Allergies] Do you have any allergies I should know about?(ie. peanuts)");
            response.writeHead(200, { 'Content-Type': 'text/xml' });
            response.end(twimlObject.toString())
            console.log(twimlObject.toString());
            break;
        case SESSIONSTATEENUM.mainMenu:

             // During the mainMenu state, the user has access to a variety of different actions, that are services,
             // such as changing preferences, or getting the locations of something to eat.

            switch (userTextMessage) {
                case ACTIONENUM.setPreferences:
                    let userInformation = new Map();
                    let twimlObject = new responseTwiml();
                    let list_of_acceptable_settings = new StringBuilder();

                    userInformation.set(DOCUMENTKEYSMAP.get(KEYSENUM.phoneNumber), userPhoneNumber);
                    userInformation.set(DOCUMENTKEYSMAP.get(KEYSENUM.sessionState), SESSIONSTATEENUM.settingPreferences);

                    mongoStoreDataMap(userInformation, false);
                    for (var first_word = 0; first_word < ACCEPTABLE_FIRST_WORD_INPUTS.length; ++first_word) {
                        list_of_acceptable_settings.append(`${ACCEPTABLE_FIRST_WORD_INPUTS[first_word]}`);
                        if (first_word != ACCEPTABLE_FIRST_WORD_INPUTS.length - 1) {
                            list_of_acceptable_settings.append(',');
                        }
                    }
                    twimlObject.message(
                        `Awesome, lets get you customized. The available options are: ${list_of_acceptable_settings.toString()}\n\
                        \nText one, all, or a combination of these settings with the word for the available option first, then \
                        the value of it afterwards. Make sure to put each setting on their own line!`
                    );
                    response.writeHead(200, { 'Content-Type': 'text/xml' });
                    response.end(twimlObject.toString());
                    console.log(twimlObject.toString());
                    break;
                case ACTIONENUM.getLocationsOfFood:    
                    // Here we will retreive the names of resteraunts based on the preferences of the user.
                    // We will need a location for the user, so we will handle part of that here.

                
            }





            break;
        case SESSIONSTATEENUM.settingPreferences:
            // If the user did not enter valid FIRST WORD identifiers for their settings 
            if (!(isGoodInput(userText))) {
                let twimlObject = new responseTwiml();
                twimlObject.message(`Hey I didn't understand one of your preferences, could you repeat yourself a little differently please?`);
                response.writeHead(200, { 'Content-Type': 'text/xml' });
                response.end(twimlObject.toString());
                console.log(twimlObject.toString());
            }
            
             // If they did enter valid first word identifiers, then update their dcoument with the data 
             // that's after the identifier for each line.
            
            else { 
                let userInformation = extractDataFromUserText(userText);
                userInformation.set(DOCUMENTKEYSMAP.get(KEYSENUM.phoneNumber), userPhoneNumber);
                userInformation.set(DOCUMENTKEYSMAP.get(KEYSENUM.sessionState), SESSIONSTATEENUM.mainMenu);
                mongoStoreDataMap( userInformation, false );

                let twimlObject = new responseTwiml();
                twimlObject.message(`Understood! Your preferences have been updated!`);
                response.writeHead(200, { 'Content-Type': 'text/xml' });
                response.end(twimlObject.toString());
                console.log(twimlObject.toString());
            }
            break;

    }





















    


    if ((!(isGoodInput(userText)))) {
        if (session.get(userPhoneNumber) < 1) {
            session.set(userPhoneNumber, 1);
            let twimlObject = new responseTwiml();
            twimlObject.message("Hi! Haven't seen you around here before! Tell me what you like! Here's how I can understand, respond to me just like this:");
            twimlObject.message("\n[Near] How close would you like to be?(ie. 5 mi)\n\n[Budget] How much do you want to spend?(ie. $8)\n\n[Allergies] Do you have any allergies I should know about?(ie. peanuts)");
            response.writeHead(200, { 'Content-Type': 'text/xml' });
            response.end(twimlObject.toString())
            console.log(twimlObject.toString());
            return;
        }
        else if (session.get(userPhoneNumber) < 2) {
            // Else you know what your typing is wrong.
            let twimlObject = new responseTwiml();
            twimlObject.message(`Hey I didn't understand something that you said, could you repeat yourself please?`);
            response.writeHead(200, { 'Content-Type': 'text/xml' });
            response.end(twimlObject.toString())
            console.log(twimlObject.toString());
            return;
        }
    }
    else {
        var value_map = extractDataFromUserText(userText);
        value_map.set('Phone_Number', userPhoneNumber);
        mongoStoreDataMap(value_map);
    }

    // After good input prompt for geolocation, only once though?
    //session.set(userPhoneNumber, 3);
    let sb = new StringBuilder();
    sb.append('<?xml version="1.0" encoding="UTF-8"?>');
    sb.append('<Response>');
    sb.append(`<Message>Where are you around?</Message>`);
    sb.append(`<Message>https://213874d6.ngrok.io/geolocation/?userNumber=${userPhoneNumber}</Message>`);
    sb.append('</Response>');
    response.writeHead(200, { 'Content-Type': 'text/xml' });
    response.end(sb.toString());
    console.log(sb.toString());
    return;
    //THE RESPONSE ENDED YOU CAN'T SEND ANY MORE.


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

app.get('/retrieveFoodInformation', (request, response) => {
    // Google maps api goes here and tomato and Z apis go here too.
    // We will retrieve the information from PostGreSQL from here as well. We should have all the information we need by now.

})

app.listen(PORT_FOR_NGRUNK, async () => {
    console.log("Express is listening on localhost:80");
});


/** Async function for connecting to the PostGres service running on the local machine. It is an async function because 
 * we need the promise syntax, and the pause in program execution.
**/

function retrieveSessionState(userCellPhoneNumber) {
    var userInformation = mongoGetDataMap(userCellPhoneNumber);
    if (typeof userInformation == 'undefined') {
        console.log(`The first document with Phone_Number value "${userCellPhoneNumber}" does not exist.`);
        return SESSIONSTATEENUM.unregistered;
    }
    else { return userInformation.sessionState; }
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
async function mongoGetDataMap(userCellPhone) {
    const URL = "mongodb://127.0.0.1:27017";
    const DB_NAME = "HackHops";
    const COLLECTION_NAME = "UserInformation";
    try {
        await MongoClient.connect(URL, (error, client) => {
            if (error) {
                console.error(`ERROR WITHIN [MongoConnect(callbackfunction)], WITH URL: "mongodb://127.0.0.1:27017" .`);
                console.error(`HERE IS THE ERROR: ${error}`);
                return;
            }
            const DB = client.db(DB_NAME);
            const COLLECTION = DB.collection(COLLECTION_NAME);
            COLLECTION.findOne({ 'Phone_Number': userCellPhone }, (error, result) => {
                if (error) {
                    console.error(error);
                    return;
                }
                return result;
            });
        });
    }
    catch (e) {
        console.error(`ERROR WITHIN [connectToPostGres()], CLIENT USER:"${client.user}", PASSWORD:"${client.password}", DATABASE:"${client.database}", HOST:"${client.host}", PORT:"${client.port}" COULD NOT CONNECT. RETURNING...`);
        return false;
    }

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
async function mongoStoreDataMap(userInformationMap, createIfNotFound) {
    const URL = "mongodb://127.0.0.1:27017";
    const DB_NAME = "HackHops";
    const COLLECTION_NAME = "UserInformation";
    try {
        await MongoClient.connect(URL, (error, client) => {
            if (error) {
                console.error(`ERROR WITHIN [MongoConnect(callbackfunction)], WITH URL: "mongodb://127.0.0.1:27017" .`);
                console.error(`HERE IS THE ERROR: ${error}`);
                return;
            }
            var json_object = mapToObj(userInformationMap);
            console.log(json_object);
            const DB = client.db(DB_NAME);
            const COLLECTION = DB.collection(COLLECTION_NAME);
            COLLECTION.updateOne(
                { 'Phone_Number': userInformationMap.get('Phone_Number') },
                { $set: json_object },
                { upsert: createIfNotFound },
                function (error, document) {
                    if (error) {
                        console.error("OHHHH MY GOODDDDDD");
                        console.error(error);
                    }
                    else { console.log(document); }
                }
            );
        });
    }
    catch (e) {
        //console.error(`ERROR WITHIN [connectToPostGres()], CLIENT USER:"${client.user}", PASSWORD:"${client.password}", DATABASE:"${client.database}", HOST:"${client.host}", PORT:"${client.port}" COULD NOT CONNECT. RETURNING...`);
        return false;
    }
    //console.log(`PostGreSQL client user:"${client.user}", password:"${client.password}", database:"${client.database}", host:"${client.host}", port:"${client.port}", connected successfully!`);
}



function mapToObj(map) {
    const obj = {}
    for (let [k, v] of map)
        obj[k] = v
    return obj
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
    const FIRSTWORD = 0;
    let first_words = [];
    let lines = userText.split("\n");

    // For each line
    for (let line = 0; line < lines.length; ++line) {


        let words = lines[line].split(" ");
        first_words.push(words[FIRSTWORD]);
        let passed_checked = false;


        for (let j = 0; j < ACCEPTABLE_FIRST_WORD_INPUTS.length; ++j) {
            if (words[FIRSTWORD] == ACCEPTABLE_FIRST_WORD_INPUTS[j]) {
                passed_checked = true;
            }
        }


        if (!(passed_checked)) {
            console.log("From passed checks");
            console.log("Failed Input");
            return false;
        }


    }

    // Making sure out of all the first words in each line, none of them repeat each other.
    for (let firstword = 0; firstword < first_words.length; ++firstword) {
        let previous = first_words.pop();
        console.log(`Previous:"${previous}"`);
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
    const FIRST_WORD = 0;
    // This is gonna loop through all of the user input.
    for (var userLine = 0; userLine < userLines.length; ++userLine) {
        /**
         * We already, or should have already have confirmed that each first word within the line is valid, so all we have to 
         * do is take the first word, store as a key witin the map, and then take whatevers after the
         * space from the first word and store that as the value for the key within the new map.
         */
        currentLine = userLines[userLine];
        words = currentLine.split(" ");
        key = words[FIRST_WORD];
        console.log( `Key: "${key}"` );
        /**
         * Get the rest of the line. We add the +1 to exclude the first space after the first word when storing the
         * rest of the string as the value in the map.
         */
        console.log( currentLine.indexOf( words[FIRST_WORD] ) + words[FIRST_WORD].length + 1);
        value = currentLine.substring( currentLine.indexOf( words[FIRST_WORD] ) + words[FIRST_WORD].length + 1 );
        console.log( `Value: "${value}"` );
        local_map.set(key,value);
    }
    return local_map;
}


/**
 * This is just a test function to test smaller pieces of the program before compining them.
**/
function test(request) {
    if ( isGoodInput( request.query.Body ) ) {
        var dataMap = extractDataFromUserText( request.query.Body );
        console.log( dataMap );
    }
    else { console.log( "Bad Input" ); }
}
