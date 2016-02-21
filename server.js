/*var fs =require('fs');
 var tls = require('tls');
 var sslOptions = {
 key: fs.readFileSync('n2m2-key.pem'),
 cert: fs.readFileSync('n2m2-cert.pem'),
 ca: fs.readFileSync('ca.crt'),
 requestCert: true,
 rejectUnauthorized: false
 };*/

var express = require('express');
var compress = require('compression');
var morgan = require('morgan');
//var csrf = require('csurf');
var bodyParser = require('body-parser');
//var methodOverride = require('method-override');
var compress = require('compression');
var session = require('express-session');

var app = express();
var server = require('http').Server(app);
var mongodb = require('mongodb').MongoClient;
var multiparty = require('connect-multiparty'); // form multipart
var toobusy = require('toobusy');
var mc = require('mc'); // memcached client

//var Cacher = require('cacher');
//var CacherMemcached = require('cacher-memcached');
//app.cacher = new Cacher(new CacherMemcached('host1:11211'/*app.mc*/));


var i18n = new require('i18n-2');
i18n.expressBind(app, {
    // setup some locales - other locales default to the first locale
    locales: ['fr', 'it', 'es', 'en', 'de']
});

app.disable('x-powered-by');

app.config = {
    dev: 1,
    cache_enabled: 1,
    path: "/var/www2/n2m2/",
    memcache_host: "127.0.0.1",
    ip: "195.154.14.237",
    url: "http://195.154.14.237:3000"
};


app.fs = require('fs');
app.xss = require('xss');
app.node_xss = require('node-xss').clean;
app.sha1 = require('sha1');
app.format = require('util').format;
app.BSON = require('mongodb').BSONPure;
app.io = require('socket.io')(server);
app.gm = require('gm').subClass({imageMagick: true});
app.multipart = multiparty();

var homeRoutes = require('./route/home');
var adminRoutes = require('./route/admin');
var userRoutes = require('./route/user');
var chatRoutes = require('./route/chat');

//var httpsApp = express();

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.use(function(req, res, next) {
    if (toobusy()) {
        res.send(503, "nice2meet2 est victime de son succès. Merci de vous reconnecter d'ici quelques minutes.");
    } else {
        next();
    }
});
app.use('/static', express.static(__dirname + '/public'));
app.use('/photo', express.static(__dirname + '/picturesToValidate'));

//app.use('/static', express.static(__dirname + '/public'), {maxAge: 86400000}); 	// set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                                         // log every request to the console

app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));                               // pull information from html in POST

//app.use(methodOverride());                                                      // simulate DELETE and PUT
app.use(session({secret: 'N2M2-Nice2Meet2-n2m2', cookie: {secure: false, maxAge: 86400000}}));
app.use(compress());

app.set('views', __dirname + '/view');
app.set("twig options", {strict_variables: false});
app.set("view cache", true);

// gestion de la session
app.use(function(req, res, next) {    
    app.i18n = req.i18n;
    req.i18n.setLocaleFromCookie();
    //res.removeHeader("X-Powered-By");           
    next();
});

userRoutes(app);
adminRoutes(app);
chatRoutes(app);
homeRoutes(app);

app.use(function(req, res) {
    res.redirect('/404');
});

/*var server = tls.createServer(sslOptions,app).listen(443, function() {
 console.log('ssl');  
 });*/

// connexions au chat
var connections = {};


app.io.sockets.on('connection', function(socket) {

    //app.get('/chat/:nickname/:id([0-9a-f]{24})', function(req, res) {
    console.dir('chat en service');

    //socket.emit('join', {});    
    socket.on('join', function(data) {
        socket.nickname = data.nickname;
        socket.receiver = data.receiver;
        connections[data.nickname] = socket;
    });

    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function(data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        if ('undefined' !== typeof (connections[data.nickname])) {

            var message = {
                user: socket.nickname,
                receiver: data.nickname,
                message: app.xss(data.message),
                date: new Date().toJSON()
            };

            var collection = app.db.collection('message');

            collection.insert(message, function(err, doc) {
                if (err) {
                    connections[message.user].emit('updatechat', {
                        nickname: "n2m2",
                        message: app.i18n.__("Le message n'a pas pu être envoyé. Merci de patienter ou de vous reconnecter.")});
                } else {
                    var _message = {
                        user: message.receiver,
                        receiver: message.user,
                        message: message.message,
                        date: message.date
                    };

                    collection.insert(_message, function(err, doc) {
                        if (err) {
                            connections[message.user].emit('updatechat', {
                                nickname: "n2m2",
                                message: app.i18n.__("Le message n'a pas pu être envoyé. Merci de patienter ou de vous reconnecter.")});
                            //throw err;
                        } else {
                            connections[message.receiver].emit('updatechat', {nickname: message.user, message: message.message});
                        }
                    });
                }
            });

            /*var xss_msg = app.xss(data.message);
             var message = JSON.stringify({u: socket.nickname, m: xss_msg, d:new Date().toJSON()});
             app.fs.appendFile(
             './chat/' + socket.nickname + '.js', message + '|', function(err) {
             
             if (err) {
             throw err;
             }
             connections[data.nickname].emit('updatechat', {nickname: socket.nickname, message: xss_msg});
             });*/
        }

        //console.dir(data);
        //console.dir(connections);
    });



    // when the user disconnects.. perform this
    socket.on('disconnect', function() {

        if ('undefined' !== typeof (connections[socket.receiver])) {
            // echo globally that this client has left
            connections[socket.receiver].emit('updatechat', 'SERVER', socket.nickname + ' has disconnected');
        }

        // remove the nickname from global connections list
        delete connections[socket.nickname];

    });
    //});
});

// memcached connexion
app.mc = new mc.Client(app.config.memcache_host);
app.mc.connect(function() {
    console.log("Connecté à memcache");    
    //app.cacher.cache('seconds', 30);
});

mongodb.connect('mongodb://127.0.0.1:27017/n2m2', function(err, _db) {
    if (err)
        return null;

    console.log("Connecté à MongoDb");
    app.db = _db;

    server.listen(3000, function() {
        console.dir("Server listening on port 3000");
    });

    process.on('SIGINT', function() {
        app.mc.disconnect();

        server.close();
        // appelle .shutdown autorisant le process à se terminier normalement
        toobusy.shutdown();
        process.exit();
    });
});