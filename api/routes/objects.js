var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('floorplanner', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'data' database");
        db.collection('data', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'data' collection doesn't exist. Creating it with sample data...");
            }
        });
    }
});


exports.findAll = function(req, res) {

   db.collection('data', function(err, collection) {
        collection.find({'clientID':req.query.clientID}).sort({timeStamp:-1}).toArray(function(err, items) {
            res.jsonp(items);
        });
    });
};

exports.fillDummyData = function(req, res) {
  
    db.collection('data', function(err, collection) { 
		var collection = db.collection('data');
		
		
		var now = new Date();
		var daysOfYear = [];
		for (var d = new Date(2016, 5, 1); d <= now; d.setDate(d.getDate() + 1)) {
	
			var date = new Date();
			item = {};
			item.dateStamp = dateStamp(d);
			item.timeStamp = Math.round(d/1000);
			item.busyRate = Math.floor((Math.random() * 100) + 1);
			item.clientID = req.query.clientID;
			
			collection.insert(item, {safe:true}, function(err, result) {
				if (err) {
					res.jsonp({'error':'An error has occurred'});
				} else {
					
				}
			});
			
		}
		res.jsonp({'success':1});

    });
}

exports.addItem = function(req, res) {
    var item = req.query;
	
    db.collection('data', function(err, collection) { 
		var collection = db.collection('data');
		
		//add the date
		var date = new Date();
		item.dateStamp = dateStamp();
		item.timeStamp = Math.round(+new Date()/1000);
		
        collection.insert(item, {safe:true}, function(err, result) {
            if (err) {
                res.jsonp({'error':'An error has occurred'});
            } else {
                res.jsonp({'success':1});
            }
        });
    });
}

function dateStamp(now) {
	// Create a date object with the current time
	if(!now)
		var now = new Date();

	// Create an array with the current month, day and time
	var date = [ now.getFullYear(), now.getMonth()+1, now.getDate()];

	// Convert hour from military time
	date[1] = ( date[1] < 10 ) ? '0'+date[1] : date[1];
	date[2] = ( date[2] < 10 ) ? '0'+date[2] : date[2];

	// Create an array with the current hour, minute and second
	var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

	// Determine AM or PM suffix based on the hour
	var suffix = ( time[0] < 12 ) ? "AM" : "PM";

	// Convert hour from military time
	time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

	// If hour is 0, set it to 12
	time[0] = time[0] || 12;

	// If seconds and minutes are less than 10, add a zero
	for ( var i = 1; i < 3; i++ ) {
		if ( time[i] < 10 ) {
		time[i] = "0" + time[i];
		}
	}

	// Return the formatted string
// 	return date.join("/") + " " + time.join(":") + " " + suffix;
	return date.join("");
}