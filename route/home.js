module.exports = function(app) {

    app.get('/', function(req, res) {
        if (typeof(req.session.user) !== 'undefined') {
            res.render('masterpage.twig', {template: "home.twig", user: req.session.user});
        } else {
            res.redirect('/home');
        }
    });

    app.get('/home', /*app.cacher.cache('days', 1),*/ function(req, res) {
        
        if (typeof(req.session.user) !== 'undefined') {
            res.render('masterpage.twig', {template: "home.twig", user: req.session.user});
        } else {            
            res.render('masterpage.twig', {template: "home.twig"});
        }
    });    
    
    app.get('/404', function(req, res) {        
        res.render('masterpage.twig', {template: "404.twig", user: req.session.user});        
    });
};