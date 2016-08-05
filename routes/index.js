'use strict';
var express = require('express');
var router = express.Router();
var client = require('../db');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
  //   var allTheTweets = tweetBank.list();
  //   res.render('index', {
  //     title: 'Twitter.js',
  //     tweets: allTheTweets,
  //     showForm: true
  //   });
      client.query('SELECT * FROM tweets INNER JOIN users ON tweets.id = users.id ', function (err, result) {
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
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.id = users.id WHERE name=$1', [name], function (err, result) {
      if (err) return next(err);
      var tweets = result.rows;
        console.log(tweets);

      res.render('index', {
        title: 'Twitter.js', 
        tweets: tweets, 
        showForm: true 
      })
    });
  });

    // var tweetsForName = tweetBank.find({ name: req.params.username });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsForName,
    //   showForm: true,
    //   username: req.params.username
    // });
  // });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    res.render('index', {
      title: 'Twitter.js',
      tweets: tweetsWithThatId // an array of only one element ;-)
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var newTweet = tweetBank.add(req.body.name, req.body.content);
    io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
  });



  return router;
}
