exports.form = function(req, res, app) {

    this.count(req, res, app, function(results) {

        var count = results;
        var category = require('../../controller/admin/category');

        category.getAll(req, res, app, function(results) {

            var categories = results;
            var specialty = require('../../controller/admin/specialty');

            specialty.getAll(req, res, app, function(results) {
                res.render('admin/masterpage_admin.twig', {
                    template: "admin/prospect/add-form.twig",
                    admin: req.session.admin,
                    categories: categories,
                    specialties: results,
                    count: count
                });
            });
        });

    });
};

exports.count = function(req, res, app, callback) {

    app.db.collection('prospect').count(function(err, count) {
        callback(count);
    });
};

exports.get = function(req, res, app, id) {

    var collection = app.db.collection('prospect');
    var o_id = new app.BSON.ObjectID.createFromHexString(id);

    collection.findOne({_id: o_id}, function(err, doc) {

        var category = require('../../controller/admin/category');
        category.getAll(req, res, app, function(results) {

            var categories = results;
            var specialty = require('../../controller/admin/specialty');

            specialty.getAll(req, res, app, function(results) {
                res.render('admin/masterpage_admin.twig', {
                    template: "admin/prospect/update-form.twig",
                    admin: req.session.admin,
                    prospect: doc,
                    categories: categories,
                    specialties: results
                });
            });
        });
    });

    /*collection.findOne({_id: o_id}, function(err, doc) {
     res.render('admin/masterpage_admin.twig', {
     template: "admin/prospect/update-form.twig",
     prospect: doc,
     admin: req.session.admin
     });
     });*/
};

exports.search = function(req, res, app) {
    var oData = [];

    if (req.body.company != "")
        oData.push({company: app.xss(req.body.company)});
    if (req.body.city != "")
        oData.push({city: app.xss(req.body.city)});
    if (req.body.postalcode != "")
        oData.push({postalcode: app.xss(req.body.postalcode)});
    if (req.body.interested != "0")
        oData.push({interested: req.body.interested});
    if (req.body.sendemail != "0")
        oData.push({sendemail: req.body.sendemail});
    if (req.body.tobecontacted != "0")
        oData.push({tobecontacted: req.body.tobecontacted});

    var collection = app.db.collection('prospect');
    collection.find({$and: oData
    }).toArray(function(err, results) {

        if (results.length === 0) {
            console.dir('recherche ko');
            res.redirect('/admin/prospect/search');
        } else {
            console.dir('recherche ok');

            res.render('admin/masterpage_admin.twig', {
                template: "admin/prospect/search-results.twig",
                admin: req.session.admin,
                result: results
            });
        }
    });

};

exports.insert = function(req, res, app) {

    var collection = app.db.collection('prospect');
    var date = new Date().toJSON();
    var prospect = {
        company: app.xss(req.body.company),
        email: app.xss(req.body.email),
        phone: app.xss(req.body.phone),
        contact: app.xss(req.body.contact),
        website: app.xss(req.body.website),
        address: req.body.address,
        city: req.body.city,
        postalcode: req.body.postalcode,
        department: req.body.department,
        deptnumber: req.body.deptnumber,
        state: req.body.state,
        country: req.body.country,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
        contract: req.body.contract,
        product: req.body.product,
        category: req.body.category,
        specialty: req.body.specialty,
        note: req.body.note,
        tobecontacteddate: app.xss(req.body.tobecontacteddate),
        tobecontacted: req.body.tobecontacted,
        sendemail: req.body.sendemail,
        interested: req.body.interested,
        comment: app.xss(req.body.comment),
        types:req.body.types,
        reviews:req.body.reviews,
        date_creation: date,
        date_update: date
    };

    collection.insert(prospect, function(err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/admin/prospect/add/failed');
        } else {
            console.dir(doc);
            res.redirect('/admin/prospect/add/success');
        }
    });
};

exports.update = function(req, res, app) {

    var collection = app.db.collection('prospect');
    var date = new Date().toJSON();
    var o_id = new app.BSON.ObjectID.createFromHexString(req.body._id);

    collection.update({_id: o_id},
    {$set: {
            company: app.xss(req.body.company),
            email: app.xss(req.body.email),
            phone: app.xss(req.body.phone),
            contact: app.xss(req.body.contact),
            website: app.xss(req.body.website),
            contract: req.body.contract,
            product: req.body.product,
            category: req.body.category,
            specialty: req.body.specialty,
            note: req.body.note,
            tobecontacteddate: app.xss(req.body.tobecontacteddate),
            tobecontacted: req.body.tobecontacted,
            sendemail: req.body.sendemail,
            interested: req.body.interested,
            comment: app.xss(req.body.comment),
            date_update: date
        }}, function(err, doc) {

        if (doc === null || doc.length === 0) {
            res.redirect('/admin/prospect/update/failed');
        } else {
            res.redirect('/admin/prospect/update/success');
        }
    });
};

exports.searchNearby = function(req, res, app) {

    var collection = app.db.collection('prospect');
    collection.find({
        coordinates: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: req.session.admin.coordinates                    
                },
                $maxDistance: parseInt(req.body.range)
            }
        }
    }).toArray(function(err, results) {

        if (results === null || results.length === 0) {
            console.dir('recherche ko');
            console.dir(err);
            res.redirect('/admin/prospect/search');
        } else {
            console.dir('recherche ok');
            
            res.render('admin/masterpage_admin.twig', {
                template: "admin/prospect/search-results.twig",
                admin: req.session.admin,
                result: results
            });
        }
    });

};