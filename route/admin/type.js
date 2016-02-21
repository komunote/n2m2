module.exports = function(app) {
    app.get('/admin/type', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            var type = require('../../controller/admin/type');
            type.search(req, res, app);
        } else {
            res.redirect('/admin');
        }
    });

    app.post('/admin/type/add', function(req, res) {

        //if ((app.config.url + "/admin/type") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {
            var type = require('../../controller/admin/type');
            type.insert(req, res, app);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.get('/admin/type/add/failed', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {template: "admin/type/add-failed.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/type/add/success', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {template: "admin/type/add-success.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/type/update/:id([0-9a-f]{24})', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            var type = require('../../controller/admin/type');
            type.get(req, res, app, req.params.id);
        } else {
            res.redirect('/admin');
        }
    });

    app.post('/admin/type/update', function(req, res) {

        //if ((app.config.url + "/admin/type") === req.headers['referer']) {
        if (typeof (req.session.admin) !== 'undefined') {
            var type = require('../../controller/admin/type');
            type.update(req, res, app);
        } else {
            res.redirect('/admin');
        }
        //}
    });

    app.get('/admin/type/update/failed', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {template: "admin/type/update-failed.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/type/update/success', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {template: "admin/type/update-success.twig", admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });
};