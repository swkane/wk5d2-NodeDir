const express = require('express');
// const data = require('./data');
const MongoClient = require('mongodb').MongoClient();
const assert = require('assert');
const path = require('path');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const app = express();
const bcrypt = require('bcrypt');
const profileController = require('./controllers/profile');
const unemployedController = require('./controllers/unemployed');
const employedController = require('./controllers/employed');
const session = require('express-session');

// Boiler Plate

// bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Mustache
app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');
// Setting up the style sheet
app.use(express.static("public"));
// Mongo
// Connection Url
var url = 'mongodb://localhost:27017/return-dir';
// session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

// !! Only run this once to set up mongo
// Use connect method to conenct to the server
// MongoClient.connect(url)
// .then(function(db) {
//   console.log("Connected Mongo to the Server!");
//   return db.collection("users").insertMany(data.users);
// });

// Routes w/o Custom Controllers

app.get("/", function(req, res){
  MongoClient.connect(url)
    .then(function(db) {
      db.collection("users")
      .find().toArray()
      .then(function(data) {
        db.close();
        // console.log(data);
        console.log(req.session.username);
        console.log(data);
        res.render('index', {users: data, currentUser: req.session.username});
      })
    })
});

// Route to find hardcoded hash
// app.get('/hash', function(req, res) {
//   let hash = bcrypt.hashSync('1234', 8);
//   console.log(hash);
//   // $2a$08$eg3hqNOmifK3lX/lKDHzruJGctYFvi1fH50MHGmmMkKOFKsF29kTy
// })


//new route
app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  req.session.username = req.body.username;
  req.session.password = req.body.password;
  MongoClient.connect(url)
  .then(function(db) {
    db.collection('users')
    .findOne({username: req.session.username})
      .then(function (data) {
        db.close()
        if (bcrypt.compareSync(req.session.password, data.passwordHash)) {
          res.redirect('/');
        } else {
          res.send('nope');
        }
      })
  })
});


//new route
app.get('/create', function(req, res) {
  res.render('createuser');
});

app.post('/create/user', function(req, res) {
  console.log("You tried to add a record!");
  req.session.password = bcrypt.hashSync(req.body.password, 8);
  MongoClient.connect(url)
    .then(function(db) {
      var robot = db.collection('users').insertOne({username: req.body.username, name: req.body.name, email: req.body.email, job: req.body.job, company: req.body.company, skills: req.body.skills, university: req.body.university, phone: req.body.phone, address: req.body.address, passwordHash: req.session.password})
      .then(function(user) {
        console.log(user);
      });
      db.close();
  });
  res.redirect('/');
});

// new route
app.get('/edit', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    db.collection('users').findOne({username: req.session.username})
    .then(function(docs) {
      console.log(docs);
      res.render('edit', docs);
    });
    db.close();
  })
});

app.post('/edit/complete', function(req, res) {
  console.log("You tried to add a record!");
  req.session.password = bcrypt.hashSync(req.body.password, 8);
  MongoClient.connect(url)
    .then(function(db) {
      var robot = db.collection('users').updateOne({username: req.session.username}, {$set: {username: req.body.username, name: req.body.name, email: req.body.email, job: req.body.job, company: req.body.company, skills: req.body.skills, university: req.body.university, phone: req.body.phone, address: req.body.address, passwordHash: req.session.password}})
      .then(function(user) {
        console.log(user);
      });
      // console.log(db.users.findOne({username: req.body.username}));
      db.close();
  });
  res.redirect('/');
});

//logout
app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

// routes w/ controllers
app.use('/unemployed', unemployedController);
app.use('/employed', employedController);
app.use('/profile', profileController);

app.listen(3000, function(){
  console.log("Robot Linked In Running on port 3000");
});
