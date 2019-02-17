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

const REQUIRED_USER_INFORMATION = ["Near", "Budget", "Allergies"];

const PORT_FOR_NGRUNK = 80;

const request = require('request');

const GOOGLEAPIKEY = "AIzaSyDGlozqJfn3b72pTYegNZYKQlCZcLF-hE0";

/**
 * We will give each stage of the interaction a string, so we know where we are with each user. 
 * When the final payload has been delivered, we will irridicate the interaction to make room for more.
 */
var session = new Map();


app.post('/geolocationLanding', (request, response) => {


    //var longitude = request.query.longitude;
    //var latitude = request.query.latitude;

    console.log("IT REDIRECTED TO LANDING");
    console.log(request.url);
    console.log(request.query.latitude);
    console.log(request.query.longitude);
    console.log(request.query.userPhone);

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
    //response.cookie( "username", userPhoneNumber );
    response.sendFile(html_path);
});

app.get('/', (request, response) => {
    // Twillio Request Objects are already in JSON Object format, NOT strings.

    //test(request);
    var userPhoneNumber = request.query.From.substring(1);

    var userText = request.query.Body;

    // Will always check for good input.
    if ( ( ! (isGoodInput(userText) ) ) ) {
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
        else if ( session.get(userPhoneNumber) < 2) {
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
        MongoStoreDataMap(value_map);
    }

    // After good input prompt for geolocation, only once though?
        session.set(userPhoneNumber, 3);
        let sb = new StringBuilder();
        sb.append('<?xml version="1.0" encoding="UTF-8"?>');
        sb.append('<Response>');
        sb.append(`<Message>Where are you around?</Message>`);
        sb.append(`<Message>https://2ff7a32c.ngrok.io/geolocation?userNumber=${userPhoneNumber}</Message>`);
        sb.append('</Response>');
        response.writeHead(200, { 'Content-Type': 'text/xml' });
        response.end(sb.toString());
        console.log(sb.toString());
        return;
        //THE RESPONSE ENDED YOU CAN'T SEND ANY MORE.
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

async function MongoGetDataMap(userCellPhone) {
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
            COLLECTION.findOne(
                { "Phone Number": userCellPhone },
                function (error, response) {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    return response;
                }
            );
        });
    }
    catch (e) {
        //console.error(`ERROR WITHIN [connectToPostGres()], CLIENT USER:"${client.user}", PASSWORD:"${client.password}", DATABASE:"${client.database}", HOST:"${client.host}", PORT:"${client.port}" COULD NOT CONNECT. RETURNING...`);
        return false;
    }

}


async function MongoStoreDataMap(userInformationMap) {
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
                { "Phone Number": userInformationMap.get("Phone Number") },
                { $set: json_object },
                { upsert: true },
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
    let first_words = [];
    let lines = userText.split("\n");
    for (let i = 0; i < lines.length; ++i) {
        let words = lines[i].split(" ");
        first_words.push(words[0]);
        let passed_checked = false;
        for (let j = 0; j < REQUIRED_USER_INFORMATION.length; ++j) {
            if (words[0] == REQUIRED_USER_INFORMATION[j]) {
                passed_checked = true;
            }
        }
        if (!(passed_checked)) {
            console.log("From passed checks");
            console.log("Failed Input");
            return false;
        }
    }

    for (let k = 0; k < first_words.length; ++k) {
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


function extractDataFromUserText(userText) {
    // ALL OF THESE ARE STRING
    var local_map = new Map();
    var userInfoArray = userText.split("\n");
    // This is gonna loop through all of the user input.
    for (var userInput = 0; userInput < userInfoArray.length; ++userInput) {
        // Sense we all have a piece of information on each line
        for (var requiredInfo = 0; requiredInfo < REQUIRED_USER_INFORMATION.length; ++requiredInfo) {
            if ((userInfoArray[userInput]).includes(REQUIRED_USER_INFORMATION[requiredInfo])) {
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
