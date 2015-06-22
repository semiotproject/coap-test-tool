"use strict";

// requirements
var logger = require('tracer').colorConsole({    
    format : "[{{timestamp}}] {{message}}",
    dateformat : "HH:MM:ss.L"
});

var argv   = require('yargs').argv;
var coap   = require('coap');
var fs     = require('fs');

logger.trace('*************************');
logger.trace('**** CoAP Test Tool *****');
logger.trace('*************************\n');

// common helpers

function performGet(reqConfig, heartbeat, index) {    
    logger.info('client #' + index + ', invoking GET request..');

    var start = (new Date()).getTime();
    var r = coap.request(reqConfig);

    r.on('response', function(res) { 
        logger.info('client #' + index + ', response received; code: ' + res.code + ', elapsed time: ' + (new Date().getTime() - start) + " ms"); 
        setTimeout(function() {
            performGet(reqConfig, heartbeat, index);
        }, heartbeat)  
    });

    r.end();
}

function performObserve(reqConfig, index) { 
    logger.info('client #' + index + ', invoking OBSERVE request..');

    reqConfig.observe = true;

    var r = coap.request(reqConfig);

    r.on('response', function(res) {
        res.on('data', function(message) {
            logger.info('client #' + index + ', observation received; code: ' + res.code);
        });
    });

    r.end();
}

function launchTest(type, heartbeat, config, index) {

    var requestConfig = {
        host: config.serverHostname,
        port: config.serverPort,
        pathname: config.serverPath
    };

    if (type === 'get') {
        performGet(requestConfig, heartbeat, index);
    } else if (type === 'observe') {
        performObserve(requestConfig, index);
    } else {
        logger.error('unsupported --type option: ' + type + '; aborting...');
        process.exit();
    }
}

function init() {
    fs.readFile('./config.json', 'utf8', function (err, data) {

        if (err) {
            logger.error('failed to open config file: ', err);
            return;
        };

        var config;
        try {
            config = JSON.parse(data);
        } catch (err) {
            logger.error('failed to parse config file: ', err);
            return;
        }

        logger.trace('CoAP server hostname is ' + (config.serverHostname || 'localhost'));
        logger.trace('CoAP server port is ' + (config.serverPort || 5683));
        logger.trace('CoAP server path is ' + (config.serverPath || '/'));

        var type = argv.type;
        if (!type) {
            logger.warn('no --type provided; expected one of next: get, observe');
            return;
        }

        var count = argv.count;
        if (!count) {
            logger.warn('no --count provided; aborting..');
            return;
        }

        var heartbeat;
        if (type === 'get') {
            heartbeat = argv.heartbeat;
            if (!heartbeat) {
                logger.warn('no --heartbeat in ms between requests provided for GET-test; aborting..');
                return;
            }
        }

        logger.info('Launching CoAP "' + type + '" test;');

        for (var i = 1; i <= count; i++) {
            logger.info('Launching ' + i + ' client of ' + count + '...');
            launchTest(type, heartbeat, config, i);
        }

    });
}

init();
