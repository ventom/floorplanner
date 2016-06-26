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
        collection.find({'clientID':req.query.clientID}).sort({$natural:-1}).limit(1).toArray(function(err, items) {
            res.jsonp(items);
        });
    });
};

exports.addItem = function(req, res) {
    var item = req.query;
	
    db.collection('data', function(err, collection) { 
		var collection = db.collection('data')
        collection.insert(item, {safe:true}, function(err, result) {
            if (err) {
                res.jsonp({'error':'An error has occurred'});
            } else {
                res.jsonp({'success':1});
            }
        });
    });
}