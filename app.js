const express = require('express');
// const data = require('./data');
const MongoClient = require('mongodb').MongoClient();
const assert = require('assert');
const path = require('path');
const mustacheExpress = require('mustache-express');
const app = express();
const profileController = require('./controllers/profile');
const unemployedController = require('./controllers/unemployed');
const employedController = require('./controllers/employed');

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

app.use('/unemployed', unemployedController);
app.use('/employed', employedController);
app.use('/profile', profileController);

app.listen(3000, function(){
  console.log("Rage Against the (Employable) Machine");
});
