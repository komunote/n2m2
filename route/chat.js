module.exports = function(app) {
    app.get('/chat/:nickname/:id([0-9a-f]{24})', function(req, res) {
        if (typeof(req.session.user) !== 'undefined') {
            res.render('masterpage.twig', {template: "chat.twig",
                user: req.session.user,
                receiver: {_id: req.params.id, nickname: req.params.nickname}

            });
        } else {
            res.render('masterpage.twig', {template: "home.twig"});
        }
    });
};
