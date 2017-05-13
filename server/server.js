var express = require('express'),
    passport = require('passport'),
    util = require('util'),
    session = require('express-session'),
    bodyParser = require("body-parser"),
    http = require('http'),
    request = require('request'),
    mongoose = require('mongoose'),
    serveStatic = require('serve-static'),
    keys = require('./config/keys'),
    SteamStrategy = require('passport-steam').Strategy;

var User = require('./models/user');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new SteamStrategy({

        returnURL: 'http://localhost:3000/auth/steam/return',
        realm: 'http://localhost:3000/',
        apiKey: keys.STEAM_APIKEY
    },
    function(identifier, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function() {

            // To keep the example simple, the user's Steam profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Steam account with a user record in your database,
            // and return that user instead.
            profile.identifier = identifier;
            return done(null, profile);
        });
    }
));

var app = express();

app.use(session({
    secret: 'your secret',
    name: 'id',
    user: 'username',
    resave: true,
    saveUninitialized: true
}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use(serveStatic('D:/GitProjects/steam-whodeletedme/public'))

mongoose.connect('mongodb://localhost/whodeletedme-db');

// GET /auth/steam
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Steam authentication will involve redirecting
//   the user to steamcommunity.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
app.get('/auth/steam',
    passport.authenticate('steam', {
            failureRedirect: '/'
        },
        function(req, res) {
            res.redirect('/');
        }));

app.get('/logout', function(req, res) {
    console.log("User logged out.");
    req.logout();
    res.redirect('/');
});

app.get('/api/identity', ensureAuthenticated, function(req, res) {
    res.status(200).send(req.user);
});

app.get('/api/friends/:steamid', ensureAuthenticated, function(req, res) {
    var steamid = req.params.steamid;
    getFriendlist(steamid, function(err, data) {
        if (err) throw err;
        res.send(data);
    });
});

function getFriendlist(id, callback) {
    request('http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=' + keys.STEAM_APIKEY + '&steamid=' + id + '&relationship=friend', function(err, response, data) {
        if (err) callback(err);
        return callback(null, data);
    });
}

app.post('/api/users', function(req, res) {
    var steamid = req.body.steamid;
    getFriendlist(steamid, function(err, data) {
        if (err) throw err;
        var date = new Date();
        // get the user starlord55
        User.findOneAndUpdate({
             steamid: steamid
        },{$set: {updated_at: date, friendslist: JSON.parse(data)}}, {upsert: true, 'new': true}, function(err, user) {
            if (err) throw err;
            res.status(200).json(user);
        });
    });
});

// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/steam/return',
    passport.authenticate('steam', {
        failureRedirect: '/'
    }),
    function(req, res) {
        res.redirect('/');
    });

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', {
        root: 'D:/GitProjects/steam-whodeletedme/public'
    });
});


app.listen(3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    console.log("ensureAuthenticated");
    if (req.isAuthenticated()) {
        return next();
    } else res.sendStatus(401);
}
