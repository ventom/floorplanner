var express = require('express'),
	csv = require('express-csv'),
    objects = require('./routes/objects');

var app = express();

app.enable("jsonp callback");

app.get('/objects', objects.findAll);
app.get('/update', objects.addItem);
app.get('/fillDummyData', objects.fillDummyData);
app.get('/exportCSV', objects.exportCSV);

app.listen(3000);
console.log('Listening on port 3000...');