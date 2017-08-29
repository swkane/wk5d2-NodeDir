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


// bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Mustache Boiler Plate
app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

// Setting up the style sheet
app.use(express.static("public"));

// Mongo Boiler Plate
// Connection Url
var url = 'mongodb://localhost:27017/return-dir';

// !! Only run this once to set up mongo
// Use connect method to conenct to the server
// MongoClient.connect(url)
// .then(function(db) {
//   console.log("Connected Mongo to the Server!");
//   return db.collection("users").insertMany(data.users);
// });

app.get("/", function(req, res){
  MongoClient.connect(url)
    .then(function(db) {
      db.collection("users")
      .find().toArray()
      .then(function(data) {
        db.close();
        // console.log(data);
        res.render('index', {users: data});
      })
    })
});

// Route to find hardcoded hash
// app.get('/hash', function(req, res) {
//   let hash = bcrypt.hashSync('1234', 8);
//   console.log(hash);
//   // $2a$08$eg3hqNOmifK3lX/lKDHzruJGctYFvi1fH50MHGmmMkKOFKsF29kTy
// })

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  MongoClient.connect(url)
  .then(function(db) {
    db.collection('users')
    .findOne({username: username})
      .then(function (data) {
        db.close()
        if (bcrypt.compareSync(password, data.passwordHash)) {
          res.redirect('/');
        } else {
          res.send('nope');
        }
      })
  })
});

app.get('/create', function(req, res) {
  res.render('createuser');
});

app.post('/create/user', function(req, res) {
  console.log("You tried to add a record!");
  let password = bcrypt.hashSync(req.body.password, 8);
  MongoClient.connect(url)
    .then(function(db) {
      var robot = db.collection('users').insertOne({username: req.body.username, name: req.body.name, university: req.body.university, passwordHash: password})
      .then(function(user) {
        console.log(user);
      });
      // console.log(db.users.findOne({username: req.body.username}));
      db.close();
  });
  // album.save()
  //   .then(function() {
  //     // actions to take on success
  //     console.log("User Added Success");
  //     db.albums.insertOne(album);
  //   })
  //   .catch(function() {
  //     console.log("User Added Record Error");
  //     // action to take on error
  //   });
  res.redirect('/');
});

app.use('/unemployed', unemployedController);
app.use('/employed', employedController);
app.use('/profile', profileController);

app.listen(3000, function(){
  console.log("Hash Slinging Slasher");
});
