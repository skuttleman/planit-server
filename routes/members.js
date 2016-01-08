var route = require('express').Router();
var messages = require('./messages');
var planits = require('./planits');
var proposals = require('./proposals');
var reviews = require('./reviews');
var tasks = require('./tasks');

module.exports = route;



route.use('/:id', function(request, response, next) {
  request.routeChain = request.routeChain || {};
  request.routeChain.memberId = request.params.id;
  next();
});

route.use('/:id/messages', messages);
route.use('/:id/planits', planits);
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
