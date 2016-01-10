try {
  require('dotenv').load();
} catch(error) {
  console.error(error);
}
var express = require('express'), app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
  credentials: true,
  allowedHeaders: ['Authorization'],
  exposedHeaders: ['Authorization'],
  origin: process.env.HOST
}));



// AUTH
var auth = require('./routes/auth');
app.use(auth);


// ROUTES
var members = require('./routes/members');
var messages = require('./routes/messages');
var planits = require('./routes/planits');
var proposals = require('./routes/proposals');
var reviews = require('./routes/reviews');
var tasks = require('./routes/tasks');
app.use('/members', members);
app.use('/messages', messages);
app.use('/planits', planits);
app.use('/proposals', proposals);
app.use('/reviews', reviews);
app.use('/tasks', tasks);



app.get('/', function(request, response) {
	
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
if (process.env.NODE_ENV === 'development') {
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
