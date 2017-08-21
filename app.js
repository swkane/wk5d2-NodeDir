const express = require('express');
const data = require('./data');
const path = require('path');
const mustacheExpress = require('mustache-express');
const app = express();

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');
app.use(express.static("public"));

app.get("/", function(req, res){
  res.render('index', data);
});

app.get("/users/:id", function(req, res){
  let myIndex = req.params.id -1;
  let profile = data.users[myIndex];
  res.render('profile', profile);
  // res.render('profile', data);
});

app.listen(3000, function(){
  console.log("To infinity and beyond!");
});

// console.log(data);
// console.log(data.users);
// console.log(data.users[0]);
