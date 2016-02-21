module.exports = function(app) {    
    app.get('/admin/moderate', function(req, res) {

        if (typeof (req.session.admin) !== 'undefined') {

            res.render('admin/masterpage_admin.twig', {
                template: "admin/moderate/index.twig",
                admin: req.session.admin});
        } else {
            res.redirect('/admin');
        }
    });

    app.get('/admin/moderate/photo/:type/:number', function(req, res) {

        if (typeof (req.session.admin) !== 'undefined') {

            var moderate = require('../../controller/admin/moderate');
            moderate.search(req, res, app,  req.params.type, req.params.number);
                        
        } else {
            res.redirect('/admin');
        }
    });
};