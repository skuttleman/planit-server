var route = require('express').Router();
var messages = require('./messages');
var planits = require('./planits');
var reviews = require('./reviews');
var knex = require('../db/knex');

module.exports = route;



route.use('/:id', function(request, response, next) {
  request.routeChain = request.routeChain || {};
  request.routeChain.memberId = request.params.id;

  next();
});

route.use('/:id/messages', messages);
route.use('/:id/planits', planits);
route.use('/:id/reviews', reviews);



// C
// No use case? Only created when logging in for first time with linkedin?
// route.post('/', function(request, response, next) {
//
// });

// R
route.get('/:id', function(request, response, next) {
  knex('members').where('id', request.params.id).then(function(members) {
    response.json({ members: members });
  });
});

// U
route.put('/:id', function(request, response, next) {
  getPermission(request.user.id).then(function(permission) {
    console.log(request.user)
    if (request.user.id == request.params.id || request.user.role_name == 'moderator' || request.user.role_name == 'admin') {
      knex('members').where('id', request.params.id).update(request.body).then(function() {
        response.json({ success: true });
      }).catch(function(err) {
        next(err);
      });
    } else {
      next('You do not have permission to perform this action');
    }
  });
});

// D
route.delete('/:id', function(request, response, next) {
  getPermission(request.user.id).then(function(permission) {
    if (request.user.id == request.params.id || request.user.role_name == 'admin') {
      if (request.user.id == request.params.id) request.logout();
      knex('members').where('id', request.params.id).del().then(function() {
        response.json({ success: true });
      }).catch(function(err) {
        next(err);
      });
    } else {
      next('You do not have permission to perform this action');
    }
  });
});

// L
route.get('/', function(request, response, next) {
  knex('members').then(function(members) {
    response.json({ members: members });
  });
});

function getPermission(memberId) {
  return knex('members').returning('roles.name').where('members.id', memberId).innerJoin('roles', 'members.role_id', 'roles.id')
  .then(function(roleNames) {
    return Promise.resolve(roleNames[0]);
  });
}
