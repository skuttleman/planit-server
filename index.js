try {
  require('dotenv').load();
} catch(error) {
  console.error(error);
}
var express = require('express'), app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(bodyParser({ extended: false }));
app.use(cors());



// AUTH
var auth = require('./routes/auth');
app.use(auth);


// ROUTES


app.get('/', function(request, response) {
	response.send(request.user ? 'loggedin' : 'loggedout');
});


app.listen(process.env.PORT, function() {
  console.log('The NSA is listening on PORT:', process.env.PORT);
});



// ERROR HANDLING
app.use(function(request, response, next) {
  var error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(error, request, response, next) {
    response.status(error.status || 500);
    response.json({
      message: error.message,
      error: error
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(error, request, response, next) {
  response.status(error.status || 500);
  response.json({
    message: error.message,
    error: {}
  });
});
