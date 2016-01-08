var route = require('express').Router();
var members = require('./members')
var messages = require('./messages');
var proposals = require('./proposals');
var reviews = require('./reviews');
var tasks = require('./tasks');

module.exports = route;



route.use('/:id', function(request, response, next) {
  request.routeChain = request.routeChain || {};
  request.routeChain.planitId = request.params.id;
  next();
});

route.use('/:id/members', members);
route.use('/:id/messages', messages);
route.use('/:id/proposals', proposals);
route.use('/:id/reviews', reviews);
route.use('/:id/tasks', tasks);



// C
route.post('/', function(request, response, next) {

});

// R
route.get('/:id', function(request, response, next) {

});

// U
route.put('/:id', function(request, response, next) {

});

// D
route.delete('/:id', function(request, response, next) {

});

// L
route.get('/', function(request, response, next) {

});
