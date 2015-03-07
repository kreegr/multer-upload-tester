var path = require('path');
var loggerName = require(path.join(__dirname, 'name'));
var bunyan = require('bunyan');

var logger = bunyan.createLogger({
    src: true, // include The source file, line and function of the log call site
    name: loggerName,
    streams: [
        {
            path: loggerName + '.log',
            level: 'trace'
        },
        {
            stream: process.stdout,
            level: 'debug'
        },
        {
            path : loggerName + '-error.log',
            level : 'error'
        }
    ],
    serializers: {
        req : bunyan.stdSerializers.req,
        res : bunyan.stdSerializers.res
    }
});

module.exports = logger;

