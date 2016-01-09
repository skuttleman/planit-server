var route = require('express').Router();

module.exports = route;



route.use('/:id', function(request, response, next) {
  request.routeChain = request.routeChain || {};
  request.routeChain.reviewId = request.params.id;
  next();
});



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
