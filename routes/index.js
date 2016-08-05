'use strict';
var express = require('express');
var router = express.Router();
var client = require('../db');

module.exports = function makeRouterWithSockets (io) {

var querySyntax = 'SELECT tweets.id, tweets.content, userid, name, pictureurl FROM tweets INNER JOIN users ON tweets.userid = users.id ';

  // a reusable function
  function respondWithAllTweets (req, res, next){
  //   var allTheTweets = tweetBank.list();
  //   res.render('index', {
  //     title: 'Twitter.js',
  //     tweets: allTheTweets,
  //     showForm: true
  //   });
      client.query(querySyntax, function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { 
        title: 'Twitter.js', 
        tweets: tweets, 
        showForm: true });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    var name = req.params.username;
    client.query(querySyntax +'WHERE name=$1', [name], function (err, result) {
      if (err) return next(err);
      var tweets = result.rows;
        res.render('index', {
        title: 'Twitter.js', 
        tweets: tweets, 
        showForm: true 
      })
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    var tweetsWithThatId = req.params.id;
    client.query(querySyntax +' WHERE tweets.id=$1', [tweetsWithThatId], function (err, result) {
      if (err) return next(err);
      var tweets = result.rows;
        res.render('index', {
        title: 'Twitter.js', 
        tweets: tweets, 
        showForm: true 
      })
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var getUser = req.body.name;
    // var userPresent = client.query('SELECT id FROM users WHERE users.name = $1', [getUser]);
    // console.log(userPresent);
    // var newTweet = tweetBank.add(req.body.name, req.body.content);
    var userid;
    client.query('SELECT id FROM users WHERE users.name = $1', [getUser], function (err, result) {
      if (err) return next(err);
      userid = result.rows.length > 0 ? result.rows[0].id : null;
      console.log("inside:", userid);
      if (!userid) {
          client.query('INSERT INTO users (name, pictureurl) VALUES ($1, $2)', [getUser, null], function (err, data) {
            if (err) return next(err);
              client.query('INSERT INTO tweets (userId, content) VALUES ((SELECT id from Users where name = $1), $2)', [getUser, req.body.content]);
              res.redirect('/');
            })
      } else {  
        client.query('INSERT INTO tweets (userId, content) VALUES ($1, $2)', [userid, req.body.content], function (err, data) {
          if (err) return next(err);
          res.redirect('/');
          });
        }
    });

    // client.query('INSERT INTO tweets (userId, content) VALUES ($1, $2)', [2, req.body.content], function (err, data) {
    //   if (err) return next(err);
    // // io.sockets.emit('new_tweet', newTweet);
    
    // /** ... */});
  });

// client.query('INSERT INTO tweets (userId, content) VALUES ($1, $2)', [10, 'I love SQL!'], function (err, data) {/** ... */});


  return router;
}
