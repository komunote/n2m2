/* GET users listing. */
module.exports = function(app) {

    app.route('/user/login')
            .get(function(req, res) {
                //if( 'https'=== req.protocol){
                //res.render('masterpage.twig', {template: "user/login-form.twig"});
                //}
                res.redirect("/home");
            })
            .post(function(req, res) {

                if ((app.config.url + "/user/login") === req.headers['referer'] ||
                        (app.config.url + "/home") === req.headers['referer']) {
                    var user = require('../controller/user');
                    user.login(req, res, app);
                } else {
                    res.redirect("/home");
                }
            });

    app.get('/user/logout', function(req, res) {
        req.session.user = undefined;
        app.io.sockets.emit('disconnect');
        res.redirect('/home');
    });

    app.get('/user', function(req, res) {
        if (typeof (req.session.user) !== 'undefined') {
            res.render('masterpage.twig', {template: "user/index.twig", user: req.session.user});
        } else {
            res.redirect('/home');
        }
    });

    app.route('/user/subscribe')
            .get(function(req, res) {
                //if( 'https'=== req.protocol){    
                if (typeof (req.session.user) !== 'undefined') {
                    res.render('masterpage.twig', {
                        template: "user/subscribe-form.twig",
                        user: req.session.user
                    });
                } else {
                    res.render('masterpage.twig', {
                        template: "user/subscribe-form.twig"//,
                                //csrf: req.csrfToken()
                    });
                }
                //}
            })
            .post(function(req, res) {

                if ((app.config.url + "/user/subscribe") === req.headers['referer'] ||
                        (app.config.url + "/home") === req.headers['referer']) {

                    var user = require('../controller/user');
                    user.insert(req, res, app);
                }
            });

    app.get('/user/subscribe/success', function(req, res) {
        res.render('masterpage.twig', {template: "user/subscribe-success.twig"});
    });

    app.get('/user/subscribe/failed', function(req, res) {
        res.render('masterpage.twig', {template: "user/subscribe-failed.twig"});
    });

    app.get('/user/update/form', function(req, res) {
        //if( 'https'=== req.protocol){
        if (typeof (req.session.user) !== 'undefined') {
            res.render('masterpage.twig', {
                template: "user/update-form.twig",
                //csrf: req.csrfToken(),
                user: req.session.user});
        } else {
            res.redirect('/home');
        }
        //}
    });

    app.route('/user/search')
            .get(function(req, res) {
                if (typeof (req.session.user) !== 'undefined') {
                    res.render('masterpage.twig', {
                        template: "user/search-form.twig",
                        user: req.session.user
                    });
                } else {
                    res.redirect('/home');
                }
            })
            .post(function(req, res) {
                if (((app.config.url + "/user/search") === req.headers['referer'] ||
                        (app.config.url + "/home") === req.headers['referer'])
                        && typeof (req.session.user) !== 'undefined') {
                    var user = require('../controller/user');
                    user.search(req, res, app);
                } else {
                    res.redirect('/home');
                }
            });

    app.get('/user/friendlist', function(req, res) {
        if (typeof (req.session.user) !== 'undefined') {
            res.render('masterpage.twig', {template: "user/friendlist.twig", user: req.session.user});
        } else {
            res.redirect('/home');
        }
    });

    app.get('/user/blacklist', function(req, res) {
        if (typeof (req.session.user) !== 'undefined') {
            res.render('masterpage.twig', {template: "user/blacklist.twig", user: req.session.user});
        } else {
            res.redirect('/home');
        }
    });


    app.post('/user/update', function(req, res) {

        //if ((app.config.url + "/admin/category") === req.headers['referer']) {
        if (typeof (req.session.user) !== 'undefined') {
            var user = require('../controller/user');
            user.update(req, res, app);
        } else {
            res.redirect('/home');
        }
        //}
    });

    app.get('/user/update/failed', function(req, res) {
        res.render('masterpage.twig', {template: "user/update-failed.twig", user: req.session.user});
    });

    app.get('/user/update/success', function(req, res) {
        res.render('masterpage.twig', {template: "user/update-success.twig", user: req.session.user});
    });

    /* ajax call */
    app.post('/user/update-location', function(req, res) {
        if (typeof (req.session.user) !== 'undefined') {
            var user = require('../controller/user');
            user.updateLocation(req, res, app);
        }
    });

    app.post('/user/search-nearby', function(req, res) {

        //if ((app.config.url + "/admin/category") === req.headers['referer']) {
        if (((app.config.url + "/user/search") === req.headers['referer'] ||
                (app.config.url + "/home") === req.headers['referer']) &&
                typeof (req.session.user) !== 'undefined') {
            var user = require('../controller/user');
            user.searchNearby(req, res, app);
        } else {
            res.redirect('/home');
        }
        //}
    });

    app.post('/user/update/picture', app.multipart, function(req, res) {
        if (typeof (req.session.user) !== 'undefined') {

            var temp = req.files.image.path;
            app.fs.readFile(temp, function(err, data) {
                var imageName = req.files.image.name;

                /// If there's an error
                if (!imageName) {

                    console.log("There was an error");
                    res.redirect("/user/update/form");
                    res.end();

                } else {
                    var path = app.config.path + "picturesToValidate/" + req.session.user._id + '/';
                    //var filename = req.body.type + "_" + req.body.number + '.jpg';
                    var filename = req.body.type + "_" + app.sha1(temp) + '.jpg';

                    app.fs.mkdir(path, function(err) {

                        if (err && err.code !== 'EEXIST') {
                            console.dir(err);
                        }

                        var newfile = path + filename;
                        var thumb = path + "thumb_" + filename;

                        // resize and remove EXIF profile data
                        app.gm(temp)
                                .resize(640, 480)
                                .autoOrient()
                                .noProfile()
                                .quality(75)
                                .write(newfile, function(err) {

                                    if (err) {
                                        console.dir(err);
                                    } else {
                                        app.gm(temp)
                                                .resize(64, 48)
                                                .autoOrient()
                                                .noProfile()
                                                .quality(75)
                                                .write(thumb, function(err) {

                                                    if (err) {
                                                        console.dir(err);
                                                    } else {
                                                        var picture = {};

                                                        if (req.body.type === 'public') {
                                                            picture = {
                                                                public: {
                                                                    number: req.body.number,
                                                                    filename: filename,                                                                    
                                                                    toValidate:1
                                                                }
                                                            };
                                                        } else {
                                                            picture = {
                                                                private: {
                                                                    number: req.body.number,
                                                                    filename: filename,                                                                    
                                                                    toValidate:1
                                                                }
                                                            };
                                                        }

                                                        var user = require('../controller/user');
                                                        user.pictureToValidate(req, res, app, picture);
                                                    }
                                                });
                                    }

                                    //res.redirect("/user/update/form");
                                });
                    });

                    //});

                    /*app.fs.mkdir(path, function(err) {
                     
                     if (err && err.code !== 'EEXIST') {
                     console.dir(err);
                     }
                     var file = path + filename;
                     /// write file to uploads/fullsize folder
                     app.fs.writeFile(file, data, function(err) {
                     
                     if (err) {
                     console.dir(err);
                     }
                     
                     var newfile = path + "resized_" + filename;
                     console.log(file);
                     // resize and remove EXIF profile data
                     app.gm(file)
                     .resize(640, 480)
                     .noProfile()
                     .autoOrient()
                     .write(newfile, function(err) {
                     console.log(file);
                     console.log(newfile);
                     
                     if (err) {
                     console.dir(err);
                     }
                     
                     //delete req.files;
                     
                     // delete 
                     app.fs.unlinkSync(file, function(err) {
                     if (err) {
                     console.dir(err);
                     }
                     });
                     
                     res.redirect("/user/update/form");
                     });
                     });
                     
                     });*/
                }
            });
        } else {
            res.redirect('/home');
        }
    });
};
