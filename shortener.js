module.exports = function(app, db) {
  
  app.route('/').get(function(req, res) {
      res.sendFile(__dirname + '/views/index.html');
    });
  app.route('/new').get(function(req, res) {
      res.sendFile(__dirname + '/views/error.html');
    });

  app.route('/:url').get(validateAndRedirect);

  app.get('/new/:url*', validateAndShorten);
  
  app.get("*", function(request, response) {
  response.end("404!");
  });

  function validateAndRedirect(req, res) {
    var url = process.env.APP_URL + req.params.url;
    if (url != process.env.APP_URL + 'favicon.ico') {
      findURL(url, db, res);
    }
  }

  function validateAndShorten(req, res) {
    var url = req.url.slice(5);
    var result = {};
    if (validateURL(url)) {
      result = {
        original_url: url,
        short_url: process.env.APP_URL + genLink()
      };
      res.send(result);
      saveToDB(result, db);
    } else {
      result = {
        error: "You pass URL in wrong format. Please check URL and try again."
      };
      res.send(result);
    }
  }

  function genLink() {
    // Generates random string for link
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  function saveToDB(obj, db) {
    var urls = db.collection('urls')
    .save(obj, function(err, result) {
      if (err) throw err;
      console.log('Saved new pair' + result);
    });
  }

  function findURL(link, db, res) {
    var urls = db.collection('urls')
    .findOne({
      "short_url": link
    }, function(err, result) {
      if (err) throw err;
      if (result) {
        console.log('Match has been found ' + result);
        res.redirect(result.original_url);
      } else {
        res.send({error: "No matches found!"});
      }
    });
  }

  function validateURL(url) {
    var regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    return regex.test(url);
  }

};