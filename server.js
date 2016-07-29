var express = require('express');
var mongo = require('mongodb').MongoClient;
var api = require('./shortener.js');

var app = express();

app.set('port', (process.env.PORT || 8080));

mongo.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/urlshortener', function(err, db) {

  if (err) {
    throw new Error('Connection error!');
  } else {
    console.log('Connected to MongoDB');
  }

  db.createCollection("urls", {
    capped: true,
    size: 5242880,
    max: 1000
  });

  api(app, db);

  var port = app.get('port');
  
  app.listen(port, function() {
    console.log('urlshortener-api app listening on port ' + port);
  });

});