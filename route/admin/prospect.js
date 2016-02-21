module.exports = function(app) {
    app.get('/admin/prospect', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {
                template: "admin/prospect/index.twig",
                admin: req.session.admin
            });
        } else {
            res.redirect('/admin');
        }
    });

    app.route('/admin/prospect/search')
            .get(function(req, res) {
                if (typeof (req.session.admin) !== 'undefined') {
                    res.render('admin/masterpage_admin.twig', {
                        template: "admin/prospect/search-form.twig",
                        admin: req.session.admin
                    });
                } else {
                    res.redirect('/admin');
                }
            })
            .post(function(req, res) {
                //if ((app.config.url + "/admin/prospect/search") === req.headers['referer']) {
                if (typeof (req.session.admin) !== 'undefined') {
                    var o = require('../../controller/admin/prospect');
                    o.search(req, res, app);
                } else {
                    res.redirect('/admin');
                }
                /*} else {
                 res.redirect('/admin');
                 }*/
            });

    app.get('/admin/prospect/add', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            var prospect = require('../../controller/admin/prospect');
            prospect.form(req, res, app);
        } else {
            res.redirect('/admin');
        }
    });

    app.post('/admin/prospect/add', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            var prospect = require('../../controller/admin/prospect');
            prospect.insert(req, res, app);
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/prospect/add/failed', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {
                template: "admin/prospect/add-failed.twig",
                admin: req.session.admin
            });
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/prospect/add/success', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {
                template: "admin/prospect/add-success.twig",
                admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/prospect/update/:id([0-9a-f]{24})', function(req, res) {

        //if ((app.config.url + "/admin/specialty") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {
            var prospect = require('../../controller/admin/prospect');
            prospect.get(req, res, app, req.params.id);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.post('/admin/prospect/update', function(req, res) {

        //if ((app.config.url + "/admin/category") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {
            var prospect = require('../../controller/admin/prospect');
            prospect.update(req, res, app);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.get('/admin/prospect/update/failed', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {template: "admin/prospect/update-failed.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/prospect/update/success', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {template: "admin/prospect/update-success.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });
    
    app.post('/admin/prospect/search-nearby', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            var prospect = require('../../controller/admin/prospect');
            prospect.searchNearby(req, res, app);
        } else {
            res.redirect('/admin');
        }
    });
};