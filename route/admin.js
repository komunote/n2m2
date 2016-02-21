module.exports = function(app) {
    var moderateRoutes = require('../route/admin/moderate');
    var categoryRoutes = require('../route/admin/category');
    var specialtyRoutes = require('../route/admin/specialty');
    var prospectRoutes = require('../route/admin/prospect');
    var criteriaRoutes = require('../route/admin/criteria');
    var typeRoutes = require('../route/admin/type');

    app.get('/admin', function(req, res) {
        if (typeof (req.session.admin) !== 'undefined') {
            res.render('admin/masterpage_admin.twig', {template: "admin/admin.twig", admin: req.session.admin});
        } else {
            res.render('admin/masterpage_admin.twig', {template: "admin/admin.twig"});
        }
    });
        
    app.get('/admin/nomenclature', function(req, res) {

        if (typeof (req.session.admin) !== 'undefined') {

            res.render('admin/masterpage_admin.twig', {
                template: "admin/nomenclature.twig",
                admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.route('/admin/login')
            .get(function(req, res) {
                //if( 'https'=== req.protocol){
                res.render('admin/masterpage_admin.twig', {
                    template: "admin/login-form.twig"
                });
                //}
            })
            .post(function(req, res) {

                if ((app.config.url + "/admin/login") === req.headers['referer'] ||
                (app.config.url + "/admin") === req.headers['referer'])  {
                    var admin = require('../controller/admin');
                    admin.login(req, res, app);
                } else {
                    res.redirect("/admin");
                }
            });

    app.get('/admin/logout', function(req, res) {
        req.session.admin = undefined;
        //req.session.regenerate();        
        res.redirect('/admin');
    });
    
    /* ajax call */    
    app.post('/admin/update-location', function(req, res) {

        if (typeof (req.session.admin) !== 'undefined') {
            console.log('ok');
            req.session.admin.location = req.body.location;
            req.session.admin.coordinates = [parseFloat(req.body.location.longitude), parseFloat(req.body.location.latitude)];
            console.dir(req.session.admin);
        }                 
    });

    moderateRoutes(app);
    categoryRoutes(app);
    specialtyRoutes(app);
    prospectRoutes(app);
    criteriaRoutes(app);
    typeRoutes(app);
};