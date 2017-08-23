const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient();
var url = 'mongodb://localhost:27017/return-dir';

// const data = require('../data');

router.get("/", function(req, res){
  MongoClient.connect(url, function(err, db){
    var users = db.collection("users");
    users.find({job: {$ne: null}}).toArray().then(function(docs) {
      // console.log(docs);
      res.render('employed', {users: docs})
    });
    db.close();
  });
});

    // .then(function(db) {
    // var chosenProfile = db.collection("users")
    //   // console.log(myIndex);
    //   .find({"id": myIndex}).then(function(err, doc) {
    //     console.log(chosenProfile);
    //   });
    //   return chosenProfile
    // });
    // db.close();

    // res.render('profile', chosenProfile);
  // let profile = data.users[myIndex];
// });

module.exports = router;
