var express = require('express'),
    objects = require('./routes/objects');

var app = express();

app.enable("jsonp callback");

app.get('/objects', objects.findAll);
app.get('/update', objects.addItem);

app.listen(3000);
console.log('Listening on port 3000...');