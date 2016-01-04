'use strict';

var express = require('express');
var app = express();
var Busboy = require('busboy');

var fstream = require('fstream');
var fs = require('fs');

var unzip = require('unzip');

app.use('/', express.static(__dirname + '/client'));
app.use('/wf', express.static(__dirname + '/export'));

app.set('port', process.env.PORT || 4000);

app.post('/upload', function(req, res, next) {
    var busboy = new Busboy({
        headers: req.headers
    });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var writeStream = fstream.Writer('./' + filename);
        file.pipe(writeStream);

        var exec = require('child_process').exec;

        exec('rm ' + filename);
    });
    busboy.on('finish', function() {
        res.writeHead(303, {
            Connection: 'close',
            Location: '/wf'
        });
        res.end();
    });
    return req.pipe(busboy);
});

var server = app.listen(app.get('port'), function() {
    console.log('Server listening on port ' + server.address().port);
});
