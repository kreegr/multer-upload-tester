"use strict";

var logger = require('./logger');
var _ = require('lodash-node');
var uploadDest = require('./thumbnail-upload-path');

var checkOffSteps = [
    'onParseStart',
    'onFileUploadData',
    'onFileUploadComplete',
    'onParseEnd'
];

var checks;
var onError = false;
var pass = function(field){
    checks[field] = "PASS";
};
var fail = function(field){
    checks[field] = "FAIL";
};

var resetChecks = function(){
    checks = {};
    onError = false;
    _.each(checkOffSteps, function(step){
        fail(step);
    });
};
resetChecks();

var multerBodyParser = require('multer')({
    dest: uploadDest
    ,
    onParseStart : function(){
        pass('onParseStart');
    },
    onError : function(err){
        onError = err;
    },
    onFileUploadData : function(file, data, req, res){
        pass('onFileUploadData');
    },
    onFileUploadComplete : function(file, req, res){
        pass('onFileUploadComplete');
    },
    onParseEnd : function(req, next){
        pass('onParseEnd');
        next();
    }
}); // for handling multipart/form-data

var LOCALS = {
    WINDS_ID : 'windsId',
    JSON_PAYLOAD : 'jsonPayload',
    THUMBNAIL_IMGS : 'imgs'
};

var setJSONPayload = function setPayloadJSON(req, res, next){
    var payload = req.body.payload;

    if (!payload){
        return res.status(400)
            .send('missing required parameter payload json');
    }

    var json;
    try {
        json = JSON.parse(payload);
    } catch (err){
        return res.status(400)
            .send('Invalid json parameter "payload" could not be parsed');
    }

    res.locals[LOCALS.JSON_PAYLOAD] = json;
    next();
};

// For convenience
var setWindsId = function setWindsId(req, res, next){
    var payload = res.locals[LOCALS.JSON_PAYLOAD];
    res.locals[LOCALS.WINDS_ID] = payload && payload.windsId;
    next();
};

var renderResponse = function renderResponse(req, res, next){
    var files = _.chain(req.files)
        .map(function(file){
            return _.omit(file, 'path')
        })
        .value();

    var json = _.extend({
        files : files
    });

    if (onError){
        json.err = onError;
    } else {
        json.checks = checks;onError
    }

    res.json(json);
    logger.info('Response Sent!' , {response:json});
    resetChecks();
};

module.exports = [
    multerBodyParser,
    setJSONPayload,
    setWindsId,
    renderResponse
];