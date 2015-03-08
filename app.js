"use strict";

var _ = require('lodash-node');
var express = require('express');
var path = require('path');
var upload = require('./upload');

var _createApp = function _createApp() {
    var app = express();
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    app.use('/', express.static(__dirname + '/public'));


    app.post('/upload', upload);



// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found!!');
        err.status = 404;
        next(err);
    });


// production error handler
// no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        var status = err.status || 500;
        res.status(status);
        res.json(err);
    });

    return app;
};


module.exports = _createApp;
