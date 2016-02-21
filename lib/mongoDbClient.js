exports.db = function(req, res) {
    var mongodb = require('mongodb').MongoClient;
    var format = require('util').format;
    var result = true;
    
    this.connect = function(table){
        mongodb.connect('mongodb://127.0.0.1:27017/n2m2',
            function(err, db) {
                var collection = db.collection(table);
            }
            );
    };
    
    this.insert = function(){
        
    };
    
    this.get = function(){
        
    };
    
    this.update = function(){
        
    };
    
    this.delete = function(){
    
    };

    

    mongodb.connect('mongodb://127.0.0.1:27017/n2m2',
            function(err, db) {
                if (err)
                    return null;

                var collection = db.collection('user');
                var user = {
                    nickname: req.body.nickname,
                    name: req.body.name,
                    firstname: req.body.firstname,
                    city: req.body.city,
                    postalcode: req.body.postalcode,
                    password: req.body.password,
                    gender: req.body.gender,
                    email: String
                };

                collection.insert(user, function(err, docs) {

                    collection.count(function(err, count) {
                        console.log(format("count = %s", count));
                    });

                    // Locate all the entries using find
                    collection.find().toArray(function(err, results) {
                        console.dir(results);
                        // Let's close the db
                        db.close();
                    });

                });

                if (err) 
                    result = null;
            });

    return result;
};

