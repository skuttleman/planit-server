var route = require('express').Router();
var tasks = require('./tasks');
var knex = require('../db/knex');
var methods = require('../methods');

module.exports = route;



route.use('/:id', function(request, response, next) {
  request.routeChain = request.routeChain || {};
  request.routeChain.planitId = request.params.id;
  next();
});

route.use('/:id/tasks', tasks);



// C
route.post('/', function(request, response, next) {
  if (request.user) {
    request.body.member_id = request.user.id;
    knex('planits').returning('*').insert(request.body).then(function(planits) {
      response.json({ success: true, planits: planits });
    });
  } else {
    next('You must be logged in to perform this action');
  }
});

// R
route.get('/:id', function(request, response, next) {
  var where = {};
  if (request.routeChain && request.routeChain.memberId) where.member_id = request.routeChain.memberId;
  where.id = request.params.id;
  knex('planits').where(where).then(function(planits) {
    response.json({ planits: planits });
  });
});

// U
route.put('/:id', function(request, response, next) {
  methods.getPermission(request.user.id).then(function(permission) {
    knex('planits').where('id', request.params.id).then(function(planits) {
      var planit = planits[0];
      if (request.user.id == planit.member_id || request.user.role_name == 'admin') {
        knex('planits').where('id', request.params.id).update(request.body).then(function() {
          response.json({ success: true });
        }).catch(function(err) {
          next(err);
        });
      } else {
        next('You do not have permission to perform this action');
      }
    });
  });
});

// D
route.delete('/:id', function(request, response, next) {
  methods.getPermission(request.user.id).then(function(permission) {
    knex('planits').where('id', request.params.id).then(function(planits) {
      var planit = planits[0];
      if (request.user.id == planit.member_id || request.user.role_name == 'admin') {
        knex('planits').where('id', request.params.id).del().then(function() {
          response.json({ success: true });
        }).catch(function(err) {
          next(err);
        });
      } else {
        next('You do not have permission to perform this action');
      }
    });
  });
});

// L
route.get('/', function(request, response, next) {
  var where = {};
  if (request.routeChain && request.routeChain.memberId) where.member_id = request.routeChain.memberId;
  knex('planits').where(where).orderBy('start_date', 'asc').then(function(planits) {
    response.json({ planits: planits });
  });
});
