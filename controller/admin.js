exports.login = function(req, res, app) {

    if ("admin_n2m2" === app.xss(req.body.login) && "19811985" === app.xss(req.body.password)) {
        console.dir('login ok');
        req.session.admin = {status: 1};        
        req.session.admin.coordinates = [parseFloat(2.322936), parseFloat(48.8300612)];
        //req.session.admin.coordinates = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];
        res.render('admin/masterpage_admin.twig', {template: "admin/admin.twig", admin: req.session.admin});
    } else {

        console.dir('login ko');
        req.session.admin = undefined;        
        res.redirect('/admin/login');
    }

};