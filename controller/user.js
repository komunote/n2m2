exports.insert = function(req, res, app) {

    var collection = app.db.collection('user');
    var date = new Date().toJSON();
    var user = {
        nickname: req.body.nickname,
        name: req.body.name,
        firstname: req.body.firstname,
        city: req.body.city,
        postalcode: req.body.postalcode,
        password: app.sha1(req.body.password),
        gender: req.body.gender,
        preference: req.body.preference,
        email: req.body.email,
        date_creation: date,
        date_update: date
    };

    //console.log(user);

    collection.insert(app.node_xss(user), function(err, doc) {

        if (doc === null || doc.length === 0) {
            console.dir('signin ko');
            res.redirect('/user/subscribe/failed');
        } else {
            console.dir('signin ok');
            res.redirect('/user/subscribe/success');
        }
    });
};

exports.update = function(req, res, app) {

    var collection = app.db.collection('user');

    var o_id = new app.BSON.ObjectID.createFromHexString(req.session.user._id);
    var date = new Date().toJSON();

    var user = {
        nickname: req.body.nickname,
        name: req.body.name,
        firstname: req.body.firstname,
        city: req.body.city,
        postalcode: req.body.postalcode,
        password: app.sha1(req.body.password),
        gender: req.body.gender,
        preference: req.body.preference,
        email: req.body.email,
        date_update: date
    };

    collection.update({_id: o_id},
    {$set: app.node_xss(user)}, function(err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/user/update/failed');
        } else {
            res.redirect('/user/update/success');
        }
    });
};

exports.pictureToValidate = function(req, res, app, data) {

    var collection = app.db.collection('user');

    var o_id = new app.BSON.ObjectID.createFromHexString(req.session.user._id);
    var date = new Date().toJSON();

    var user = {};
    user.date_update = date;

    if (typeof (req.session.user.pictures) === 'undefined') {
        user.pictures = {};
    } else {
        user.pictures = req.session.user.pictures;
    }

    if (typeof (user.pictures.public) === 'undefined') {
        user.pictures.public = {};
    }

    if (typeof (user.pictures.private) === 'undefined') {
        user.pictures.private = {};
    }

    if (typeof (data.public) !== 'undefined') {
        user.pictures.public[data.public.number] = data.public;
    } else if (typeof (data.private) !== 'undefined') {
        user.pictures.private[data.private.number] = data.private;
    }

    console.dir(user);

    collection.update({_id: o_id},
    {$set: user}, function(err, doc) {
        // delete actual file
        //app.fs.unlinkSync(file, function(err) {if (err) {console.dir(err);}});

        if (err) {
            console.dir(err);
            res.redirect("/user/update/form");
        } else {
            req.session.user.pictures = user.pictures;
            
            res.redirect("/user/update/form");
        }


    });
};

exports.search = function(req, res, app) {
    var oData = [];

    if (req.body.nickname != "")
        oData.push({nickname: app.xss(req.body.nickname)});
    if (req.body.city != "")
        oData.push({city: app.xss(req.body.city)});
    if (req.body.postalcode != "")
        oData.push({postalcode: app.xss(req.body.postalcode)});

    var collection = app.db.collection('user');

    var template = function(results) {
        if (results === null || results.length === 0) {
            console.dir('recherche ko');

            res.redirect('/user/search');
        } else {
            console.dir('recherche ok');

            res.render('masterpage.twig', {
                template: "user/search-results.twig",
                user: req.session.user,
                result: results
            });
        }
    };

    var key = app.sha1(JSON.stringify(oData));
    console.log(key);

    app.mc.get(key, function(err, results) {
        if (!err && app.config.cache_enabled === 1) {
            console.log("cached data found");

            template(JSON.parse(results[key]));

        } else {
            collection.find({$and: oData}).toArray(function(err, results) {

                if (app.config.cache_enabled === 1) {
                    app.mc.set(key, JSON.stringify(results), {flags: 0, exptime: 1800}, function(err, status) {
                        if (!err) {
                            console.log("data stored");
                        } else {
                            console.log(err);
                        }

                        template(results);
                    });
                } else {
                    template(results);
                }
            });
        }
    });



};

exports.login = function(req, res, app) {

    var collection = app.db.collection('user');

    collection.findOne({
        email: app.xss(req.body.email),
        password: app.sha1(app.xss(req.body.password))
    }, function(err, user) {

        if (user === null) {
            console.dir('login ko');
            req.session.user = null;
            res.redirect('/login');
        } else {
            console.dir('login ok');
            req.session.user = user;
            req.session.save();
            res.redirect('/home');
            //res.render('masterpage.twig', {template: "user/search.twig", user: req.session.user});
        }
    });
};

exports.updateLocation = function(req, res, app) {

    var collection = app.db.collection('user');
    var o_id = new app.BSON.ObjectID.createFromHexString(req.session.user._id);

    var user = {
        coordinates: [parseFloat(req.body.location.longitude), parseFloat(req.body.location.latitude)],
        location: req.body.location
    };
    user.location.coordinates = [parseFloat(user.location.longitude), parseFloat(user.location.latitude)];

    collection.update({_id: o_id},
    {$set: user}, function(err, doc) {

        if (doc === null || doc.length === 0) {
            //res.redirect('/user/update/failed');
            console.dir(err);
        } else {
            req.session.user.coordinates = user.coordinates;
            req.session.user.location = user.location;
            req.session.save();
            //res.redirect('/user/update/success');
        }
    });
};

exports.searchNearby = function(req, res, app) {

    var key = app.sha1(req.session.user.coordinates + "_" + req.body.range);
    console.log(key);

    var collection = app.db.collection('user');

    var template = function(results) {
        if (results === null || results.length === 0) {
            console.dir('recherche ko');
            console.dir(err);
            res.render('masterpage.twig', {template: "user/search.twig", user: req.session.user});
        } else {
            console.dir('recherche ok');
            res.render('masterpage.twig', {template: "user/search-results.twig", user: req.session.user, result: results});
        }
    };

    app.mc.get(key, function(err, results) {
        if (!err && app.config.cache_enabled === 1) {
            console.log("cached data found");
            
            template(JSON.parse(results[key]));

        } else {
            collection.find({
                coordinates: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: req.session.user.coordinates
                        },
                        $maxDistance: parseInt(req.body.range)
                    }
                }
            }).toArray(function(err, results) {
                if (app.config.cache_enabled === 1) {
                    console.log('before');
                    console.log(results);
                    app.mc.set(key, JSON.stringify(results), {flags: 0, exptime: 1800}, function(err, status) {
                        if (!err) {
                            console.log("data stored");
                        } else {
                            console.log(err);
                        }

                        template(results);
                    });
                } else {
                    template(results);
                }
            });
        }
    });



};