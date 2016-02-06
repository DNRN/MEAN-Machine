var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var port = process.env.PORT || 8080;

mongoose.connect('mongodb://dnrn:mean.16@ds054128.mongolab.com:54128/mean-machine');
var User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure CORS requests
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

    next();
});

app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Welcome to the home page!');
});

var apiRouter = express.Router();

apiRouter.use((req, res, next) => {
    console.log('Someone entered the API');

    // Authenticatione middelware goes here..

    next();
});

apiRouter.get('/', (req, res) => {
    res.json({ message: "Horay welcome to the API" })
});

apiRouter.route('/users')
    .post((req, res) => {
        var user = new User();

        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save((err) => {
            if (err) {
                if (err.code == 11000) {
                    return res.json({
                        success: false,
                        message: 'A user with that username already exist.'
                    });
                } else {
                    return res.send(err);
                }
            }
            res.json({
                message: 'User created'
            })
        });

    })
    .get((req, res) => {
        User.find((err, users) => {
            if (err) res.send(err);

            res.json(users);
        })
    });

apiRouter.route('/users/:user_id')
    .get((req, res) => {
        User.findById(req.params.user_id, (err, user) => {
            if (err) res.send(err);
            res.json(user);
        })
    })

    .put((req, res) => {
        User.findById(req.params.user_id, (err, user) => {
            if (err) res.send(err);
            
            // Update User
            if (req.body.name)
                user.name = req.body.name;
            if (req.body.username)
                user.username = req.body.username;
            if (req.body.password)
                user.password = req.body.password;

            user.save((err) => {
                if (err) res.send(err);
                res.json({
                    message: 'User updated'
                });
            });
        });
    })

    .delete((req, res) => {
        User.remove({
            _id: req.params.user_id
        }, (err, user) => {
            if (err) res.send(err);
            res.json({
                message: 'User deleted'
            });
        });
    });

app.use('/api', apiRouter);

app.listen(port);

console.log('Magic happens on port ' + port);