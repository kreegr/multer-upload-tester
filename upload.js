"use strict";

var logger = require('./logger');
var _ = require('lodash-node');
var uploadDest = require('./thumbnail-upload-path');

var checkOffSteps = [
    'onParseStart',
    'onError',
    'onFileUploadData',
    'onFileUploadComplete',
    'onParseEnd'
];

var checks;
var checkoff = function(field, err){
    logger.info(field);
    err && logger.error(err);
    checks[field] = 'okay';
};
var resetChecks = function(){
    checks = {};
    checkOffSteps.forEach(function(key){
        checks[key] = 'failed'
    });
};

resetChecks();

var multerBodyParser = require('multer')({
    dest: uploadDest
    ,
    onParseStart : function(){
        checkoff('onParseStart');
    },
    onError : function(err){
        checkoff('onError', err);
    },
    onFileUploadData : function(file, data, req, res){
        checkoff('onFileUploadData');
    },
    onFileUploadComplete : function(file, req, res){
        checkoff('onFileUploadComplete');
    },
    onParseEnd : function(req, next){
        checkoff('onParseEnd');
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
    var files = _.omit(req.files, 'path');
    var json = _.extend({
        files : files
    }, {
        checks : checks
    });
    res.json(json);
    resetChecks();
};

module.exports = [
    multerBodyParser,
    setJSONPayload,
    setWindsId,
    renderResponse
];