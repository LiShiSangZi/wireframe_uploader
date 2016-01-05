'use strict';

var express = require('express');
var app = express();
var Busboy = require('busboy');
var path = require('path');

var fstream = require('fstream');
var fs = require('fs');

var unzip = require('unzip');

app.use('/', express.static(__dirname + '/client'));
app.use('/wf', express.static(__dirname + '/export'));

app.set('port', process.env.PORT || 4000);


var exec = require('child_process').exec;

app.post('/upload', function(req, res, next) {
    var busboy = new Busboy({
        headers: req.headers
    });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        if (mimetype != 'application/zip') {
            res.status(401).send('Need a ZIP file.');
            return;
        }
        var writeStream = fstream.Writer('./zip/' + filename);
        file.pipe(writeStream);
        var p = path.resolve('.');

        file.on('end', function() {
            exec('rm -rf ./export && mkdir export && unzip ./zip/' + filename + ' -d ./export/', function() {
                res.writeHead(303, {
                    Connection: 'close',
                    Location: '/wf/' + filename.replace(/\.(.*)$/, '') + '/index.html'
                });
                res.end();
            });
        });
    });
    return req.pipe(busboy);
});

var server = app.listen(app.get('port'), function() {
    console.log('Server listening on port ' + server.address().port);
});
