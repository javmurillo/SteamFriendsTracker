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
    SteamWebAPI = require('steam-web'),
    SteamStrategy = require('passport-steam');

var app = express();

var User = require('./models/user');
var steam = new SteamWebAPI({
    apiKey: keys.STEAM_APIKEY,
    format: 'json'
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// Use the SteamStrategy within Passport.
//   Register a new user and return back to authenticate(), which will
//   call serializeUser().
passport.use(new SteamStrategy({
        returnURL: 'http://localhost:3000/auth/steam/return',
        realm: 'http://localhost:3000/',
        apiKey: keys.STEAM_APIKEY
    },
    function(identifier, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function() {
            profile.identifier = identifier;

            var steamid = profile.id;
            var displayName = profile.displayName;
            var photos = profile.photos;
            var date = new Date();
            User.findOneAndUpdate({
                steamid: steamid
            }, {
                $set: {
                    displayName: displayName,
                    photos: photos,
                    updated_at: date
                }
            }, {
                upsert: true,
                'new': true
            }, function(err, user) {
                return done(err, user);
            });
        });
    }
));



app.use(session({
    secret: 'your secret',
    name: 'id',
    user: 'username',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use(serveStatic('D:/GitProjects/steam-whodeletedme/public'))

mongoose.connect('mongodb://localhost/whodeletedme-db');

// GET /auth/steam
//   The first step in Steam authentication will involve redirecting
//   the user to steamcommunity.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
app.get('/auth/steam',
    passport.authenticate('steam', {
            failureRedirect: '/'
        },
        function(req, res) {
            res.redirect('/');
        }));

// GET /logout
//   Destroys the session
app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
});

// GET /api/identity
//    Return the user profile
app.get('/api/identity', ensureAuthenticated, function(req, res) {
    res.status(200).json(req.user);
});

// GET /api/steam/profile/:steamid
//    200 - OK. Return the steam profile(s) (without friendslist) given by the steamid(s)
//    500 - Internal Server Error. Return "Steam API call error"
app.get('/api/steam/profile/:steamid', function(req, res) {
      var steamid = req.params.steamid;
      var steamidArray = [];
      steamidArray.push(steamid);
      steam.getPlayerSummaries({
          steamids: steamidArray,
          callback: function(err, data) {
            if (err) return res.status(500).json({
                error: "Steam API call error"
            });
            res.status(200).json(data);
          }
      })
});

// GET /api/steam/friendslist/
//    200 - OK. Return the steam friendslist given by the steamid
//    500 - Internal Server Error. Return "Steam API call error."
app.get('/api/steam/friendslist/:steamid', function(req, res) {
    var steamid = req.params.steamid;
    steam.getFriendList({
        steamid: steamid,
        relationship: 'all',
        callback: function(err, data) {
            if (err) return res.status(500).json({
                error: "Steam API call error"
            });
            res.status(200).json(data);
        }
    });
});

// PATCH /api/users/:steamid
//    200 - OK. If user's friendslist updated successfully.
//    500 - Internal Server Error.
//          Return "Steam API call error" or
//          "MongooDB error"
//    404 - Not Found. Return "User not found".
app.patch('/api/users/:steamid', function(req, res) {
  return res.sendStatus(500);
    var steamid = req.params.steamid;
    var date = new Date();
    steam.getFriendList({
        steamid: steamid,
        relationship: 'all',
        callback: function(err, data) {
            if (err) return res.status(500).json({
                error: "Steam API call error"
            });
            var date = new Date();
            User.findOneAndUpdate({
                steamid: steamid
            }, {
                $set: {
                    friendslist: data.friendslist,
                    updated_at: date
                }
            }, {
                new: true
            }, function(err, user) {
                if (err) res.status(500).json({
                    error: "MongooDB error"
                });
                else if (!user) res.status(404).json({
                    error: "User not found"
                });
                else res.sendStatus(200);
            });
        }
    });
});

// GET /api/users/changes/:steamid
//    200 - OK. Return user's changes (comparison between currend and stored list).
//    500 - Internal Server Error.
//          Return "Steam API call error." or
//          "MongooDB error."
//    404 - Not Found. Return "User not found".
app.get('/api/users/changes/:steamid', ensureAuthenticated, function(req, res) {
    var steamid = req.params.steamid;
    User.findOne({
        steamid: steamid
    }, function(err, user) {
        if (err) res.status(500).json({
            error: "MongooDB error"
        });
        else if (user) {
            var result = {}
            result['deletedFriends'] = [];
            result['addedFriends'] = [];
            var storedList = user.friendslist;
            //New user with no friendlist
            if (storedList == undefined) res.status(200).json(result);
            else {
                steam.getFriendList({
                    steamid: steamid,
                    relationship: 'all',
                    callback: function(err, data) {
                        if (err) return res.status(500).json({
                            error: "Steam API call error"
                        });
                        var currentList = data.friendslist;
                        var mergedJson = currentList.friends.concat(storedList.friends);
                        var currentListAux = {};
                        currentList.friends.forEach(function(currentObject) {
                            currentListAux[currentObject.steamid] = true;
                        });
                        var storedListAux = {};
                        storedList.friends.forEach(function(currentObject) {
                            storedListAux[currentObject.steamid] = true;
                        });
                        var deletedFriends = mergedJson.filter(function(currentObject) {
                            if (currentObject.steamid in currentListAux) {
                                return false;
                            } else {
                                return true;
                            }
                        });
                        var addedFriends = mergedJson.filter(function(currentObject) {
                            if (currentObject.steamid in storedListAux) {
                                return false;
                            } else {
                                return true;
                            }
                        });
                        console.log(deletedFriends)
                        result['deletedFriends'] = deletedFriends;
                        result['addedFriends'] = addedFriends;

                        res.status(200).json(result);
                    }
                });
            }
        } else res.status(404).json({
            error: "User not found"
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
function ensureAuthenticated(req, res, next) {
    console.log("ensureAuthenticated");
    if (req.isAuthenticated()) {
        return next();
    } else res.sendStatus(401);
}
