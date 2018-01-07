var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var clientSessions = require("client-sessions");
var bcrypt = require('bcryptjs');
var User = require("./models/user");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
//CREATE A SESSION
app.use(clientSessions({
    cookieName: "session",
    secret: "random",
    duration: 30 * 60 * 1000, //in ms
    activeDuration: 5 * 60 * 1000
}));

mongoose.connect("mongodb://localhost/auth_app", {useMongoClient: true});
mongoose.Promise = global.Promise;

app.get('/', function(req, res) {
    res.render("index");
});

app.get('/register', function(req, res) {
    res.render("register");
});

app.post('/register', function(req, res) {
    //TAKES PASSWORD FIELD AND SAVES IT TO HASH VARIABLE
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);

    var userObj = {
        fName: req.body.fName,
        lName: req.body.lName,
        email: req.body.email,
        password: hash //SETS PASSWORD IN USER OBJECT TO THE HASH
    }

    User.create(userObj, function(err, user){
        if(err){
            console.log(err);
            var error = "Something went wrong! Please try again";

            if(err.code === 11000){
                error = "That email has already been taken.";
            }
            res.render("register", {error: error});
        }
        else {
            //SETS THE SESSION TO THE USER OBJECT
            req.session.user = user;
            res.redirect("/dashboard");
        }
    });
});

app.get('/login', function(req, res) {
    res.render("login");
});

app.post('/login', function(req, res) {
    User.findOne({email: req.body.email}, function(err, user){
        var error = "";
        if(!user){
            error = "That user doesn't exist";
            res.render("login", {error: error});
        } else {
            //DECRYPTS THE PASSWORDS AND COMPARES THEM
            if(bcrypt.compareSync(req.body.password, user.password)){
                req.session.user = user;
                res.redirect("/dashboard");
            }  else {
                error = "Incorrect password";
                res.render("login", {error: error})
            }
        }
        console.log(error);
    });
});

app.get('/dashboard', function(req, res) {
    //IF THERE IS A SESSION AND THE IS A USER IN THE SESSION
    if(req.session && req.session.user){
        User.findOne({email: req.session.user.email}, function(err, user){
            if(!user){
                //IF THE USER SESSION EXPIRES, RESET THE SESSION
                req.session.reset();
                res.redirect("/login");
            } else {
                //SEND THE CURRENT USER OBJECT TO THE RESPONSE HEADER AND IT BECOMES AVAILABLE TO ALL TEMPLATES
                res.locals.user = user;
                res.render("dashboard");
            }
        })
    } else {
        res.redirect("/login");
    }
});

app.get('*', function(req, res) {
    res.send("<h1>404</h1>");
});

app.listen(3000, function() {
    console.log('App listening on port 3000!');
});