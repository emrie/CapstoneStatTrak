var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(session({
    secret: 'cookie'
    //cookie: {
        //maxAge: 60 * 60 * 1000
    //}
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

var fs = require("fs");
var mongoose = require('mongoose');

//start server
server.listen('3000');

//connect to the database
mongoose.connect('mongodb://localhost:27017/test');

//load all the schema models
fs.readdirSync(__dirname + '/models').forEach(function(filename) {
    if (~filename.indexOf('.js')) require(__dirname + '/models/' + filename)
});

//set up the templating engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//link favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

var authenticate = function(req, res, next) {
    if (req.session.account) {
        next();
    } else {
        res.redirect('/');
    }
}

app.get('/team_player', function(req, res) {
    mongoose.model('team').find(function(err, team) {
        mongoose.model('player').find({
            '_id': {
                $in: team[0].players
            }
        }, function(err, player) {
            res.send(JSON.stringify(player));
        });
    });
});

app.get('/player', function(req, res) {
    mongoose.model('player').find(function(err, players) {
        res.send(players);
    });
});

app.get('/team', function(req, res) {
    mongoose.model('team').find(function(err, teams) {
        res.send(teams);
    });
});

app.get('/accounts', function(req, res) {
    mongoose.model('account').find({
        'username': 'deamel'
    }, function(err, accounts) {
        res.send(accounts);
    });
});

app.get('/games', function(req, res) {
    console.log(req);
    mongoose.model('game').find({}, function(err, games) {
        res.send(games);
    });
});

var sess;

app.all('/', function(req, res, next) {
    sess = req.session;
    //Session set when user Request our app via URL
    if (sess.account) {
        res.redirect('/mainpage');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', function(req, res) {
    res.render('login', {});
});

app.post('/login', function(req, res) {
    mongoose.model('account').find({
        'username': req.body.user
    }, function(err, account) {
        if (err || account.length == 0) {
            res.render('login', {
                error: "Invalid Credentials"
            });
        } else {
            if (req.body.password == account[0].password) {
                sess = req.session;
                sess.account = account[0];
                res.redirect('/mainpage');
            } else {
                res.render('login', {
                    error: "Invalid Credentials"
                });
            }
        }
    });
});

app.post('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

app.get('/mainpage', authenticate, function(req, res, next) {
    mongoose.model('game').find({
        $or: [{
            'awayTeamCode': req.session.account.school_code
        }, {
            'homeTeamCode': req.session.account.school_code
        }]
    }).sort('-date').exec(function(err, games) {
        var game = [];
        for (var i = 0; i < games.length; i++) {
            var this_game = {};
            if (games[i].awayTeamCode == req.session.account.school_code) {
                if (games[i].homeScore < games[i].awayScore) {
                    this_game.result = "w";
                } else if (games[i].homeScore > games[i].awayScore) {
                    this_game.result = "l";
                } else {
                    this_game.result = "t";
                }
                this_game.score = games[i].awayScore + " - " + games[i].homeScore;
                this_game._id = games[i]._id;
            } else if (games[i].homeTeamCode == req.session.account.school_code) {
                if (games[i].homeScore > games[i].awayScore) {
                    this_game.result = "w";
                } else if (games[i].homeScore < games[i].awayScore) {
                    this_game.result = "l";
                } else {
                    this_game.result = "t";
                }
                this_game.score = games[i].homeScore + " - " + games[i].awayScore;
                this_game._id = games[i]._id;
            }
            game.push(this_game);
        }
        mongoose.model('schedule').find({
            'team_id': req.session.account.school_code
        }, function(err, upcoming) {
            res.render('mainpage', {
                games: game,
                scheduledGames: upcoming
            });
        });
    });
});

app.get('/registration', function(req, res, next) {
    res.render('registration', {});
});

app.get('/account', authenticate, function(req, res, next) {
    if (req.session.account.type == "c") {
        mongoose.model('team').find({
            'teamCode': req.session.account.school_code
        }, function(err, team) {
            mongoose.model('player').find({
                '_id': {
                    $in: team[0].players
                }
            }, function(err, players) {
                console.log(players);
                res.render('account', {
                    type: req.session.account.type,
                    players: players
                });
            });
        });

    } else {
        res.render('account', {
            type: req.session.account.type
        });
    }
});

app.post('/changePassword', function(req, res) {
    if (req.session.account.password == req.body.oldpassword) {
        if (req.body.newpassword == req.body.confirm_newpassword) {
            mongoose.model('account').update({
                '_id': req.session.account._id
            }, {
                $set: {
                    'password': req.body.newpassword
                }
            }, function(err) {
                if (err)
                    console.log(err);
                else {
                    res.redirect('/mainpage');
                }
            });
        } else {
            if (req.session.account.type == "c") {
                mongoose.model('team').find({
                    'teamCode': req.session.account.school_code
                }, function(err, team) {
                    mongoose.model('player').find({
                        '_id': {
                            $in: team[0].players
                        }
                    }, function(err, players) {
                        console.log("ok");
                        res.render('account', {
                            type: req.session.account.type,
                            players: players,
                            error: "The passwords do not match."
                        });
                    });
                });

            } else {
                res.render('account', {
                    type: req.session.account.type,
                    error: "The passwords do not match."
                });
            }
        }
    } else {
        if (req.session.account.type == "c") {
            mongoose.model('team').find({
                'teamCode': req.session.account.school_code
            }, function(err, team) {
                mongoose.model('player').find({
                    '_id': {
                        $in: team[0].players
                    }
                }, function(err, players) {
                    console.log(players);
                    res.render('account', {
                        type: req.session.account.type,
                        players: players,
                        error: "Invalid password."
                    });
                });
            });

        } else {
            res.render('account', {
                type: req.session.account.type,
                error: "Invalid password."
            });
        }
    }
});

app.post('/registration', function(req, res) {
    mongoose.model('account').find({
        'username': req.body.username
    }, function(err, account) {
        if (req.body.password != req.body.password_confirm) {
            res.render('registration', {
                error: "The passwords do not match."
            })
        } else if (account.length > 0) {
            res.render('registration', {
                error: "Username is taken."
            });
        } else {
            if (req.body.type == undefined) {
                mongoose.model('team').find({
                    "teamCode": req.body.teamCode
                }, function(err, team) {
                    if (team.length > 0) {
                        mongoose.model('account').create({
                            'name': {
                                'first': req.body.firstname,
                                'last': req.body.lastname
                            },
                            'username': req.body.username,
                            'email': req.body.email,
                            'password': req.body.password,
                            'school_code': req.body.teamCode
                        });
                        mongoose.model('player').create({
                            'name': {
                                'first': req.body.firstname,
                                'last': req.body.lastname
                            },
                            'number': req.body.number,
                            'username': req.body.username,
                            '_id': mongoose.Types.ObjectId()
                        }, function(err) {
                            mongoose.model('player').find({
                                'username': req.body.username
                            }, function(err, player) {
                                console.log(player);
                                mongoose.model('team').update({
                                    'teamCode': req.body.teamCode
                                }, {
                                    $push: {
                                        'players': player[0]._id
                                    }
                                }, function(err) {
                                    res.redirect('/login');
                                });
                            });
                        });
                    } else {
                        res.render('registration', {
                            error: "Team does not exist."
                        })
                    }
                });
            } else {
                mongoose.model('team').find({
                    "teamCode": req.body.teamCode
                }, function(err, team) {
                    if (team.length == 0) {
                        mongoose.model('account').create({
                            'name': {
                                'first': req.body.firstname,
                                'last': req.body.lastname
                            },
                            'username': req.body.username,
                            'email': req.body.email,
                            'password': req.body.password,
                            'school_code': req.body.teamCode,
                            'type': req.body.type
                        });
                        mongoose.model('team').create({
                            'team': req.body.teamName,
                            'teamCode': req.body.teamCode
                        }, function(err) {
                            if (err)
                                console.log(err);
                        });
                    }
                });

                res.redirect('/login');
            }
        }
    });
});

app.get('/StatTrak', authenticate, function(req, res, next) {
    res.render('StatTrak', {
        homeTeam: req.session.account.school_code
    });
});

app.get('/password_reset', function(req, res) {
    res.render("password_reset", {});
});

app.post('/password_reset', function(req, res) {
    mongoose.model('account').find({
        'email': req.body.email
    }, function(err, account) {
        if (account.length == 0) {
            res.render("password_reset", {
                error: "No accounts are registered under that email."
            });
        } else {
            res.redirect("login");
        }
    });
});

app.post('/scheduleGame', function(req, res) {
    mongoose.model('schedule').create({
        'location': req.body.location,
        'date': req.body.date,
        'AwayTeam': req.body.teamName,
        'team_id': req.session.account.school_code
    }, function(err) {
        if (err)
            console.log(err);
        else {
            res.redirect('/mainpage');
        }
    });
});

app.get('/stats', authenticate, function(req, res) {
    mongoose.model('team').find({
        'teamCode': req.session.account.school_code
    }, function(err, team) {
        //console.log(team);
        if (team[0] !== undefined) {
            mongoose.model('player').find({
                '_id': {
                    $in: team[0].players
                }
            }, function(err, player) {
                res.render('stats', {
                    team: team[0].team,
                    players: player
                });
            });
        }
    });
});

app.post('/viewGame', authenticate, function(req, res) {
    mongoose.model('game').find({
        "_id": req.body.gameID
    }, function(err, game) {
        res.render('gameStat', {
            team1: game[0].homeTeamName,
            team2: game[0].awayTeamName,
            homePlayers: game[0].homeTeam,
            awayPlayers: game[0].awayTeam
        })
    });
});

io.sockets.on('connection', function(socket) {
    socket.on('getPlayers', function(teamCode, callback) {
        mongoose.model('team').find({
            'teamCode': teamCode
        }, function(err, team) {
            if (team[0] !== undefined) {
                mongoose.model('player').find({
                    '_id': {
                        $in: team[0].players
                    }
                }, function(err, player) {
                    callback(player, team[0].team);
                });
            }
        });
    });
    socket.on('save', function(players1, players2, score1, score2, teamCode1, teamCode2, team1, team2, callback) {
        if (teamCode1 == null || teamCode2 == null || !(score1 > 0 || score2 > 0)) {
            callback("error");
        } else {
            callback("success");
        }
        mongoose.model('game').create({
            'homeTeamName': team1,
            'awayTeamName': team2,
            'homeTeamCode': teamCode1,
            'homeScore': score1,
            'homeTeam': players1,
            'awayTeam': players2,
            'awayTeamCode': teamCode2,
            'awayScore': score2,
            '_id': mongoose.Types.ObjectId()
        }, function(err) {
            if (err) console.log(err);
        });
        for (var i = 0; i < players1.length; i++) {
            mongoose.model('player').update({
                '_id': players1[i]._id
            }, {
                $inc: {
                    'pt1': players1[i].pt1,
                    'pt2': players1[i].pt2,
                    'pt3': players1[i].pt3
                }
            }, function(err, player) {});
        }
        for (var i = 0; i < players2.length; i++) {
            mongoose.model('player').update({
                '_id': players2[i]._id
            }, {
                $inc: {
                    'pt1': players2[i].pt1,
                    'pt2': players2[i].pt2,
                    'pt3': players2[i].pt3
                }
            }, function(err, player) {});
        }
    });
});
