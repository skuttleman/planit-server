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
    }).catch(next);
  } else {
    next('You must be logged in to perform this action');
  }
});

// R
route.get('/:id', function(request, response, next) {
  var where = {};
  if (request.routeChain && request.routeChain.memberId) {
    where.member_id = request.routeChain.memberId;
  }
  where['planits.id'] = request.params.id;
  Promise.all([
    knex('planits').select('planits.*', 'planit_types.name as planit_type_name')
    .leftJoin('planit_types', 'planits.planit_type_id', 'planit_types.id')
    .where(where),
    knex('tasks')
    .select('tasks.*', 'skills.name as skill_name', 'skill_description.description as description')
    .leftJoin('skills', 'tasks.skill_id', 'skills.id')
    .leftJoin('skill_description', 'tasks.id', 'skill_description.id')
    .where('tasks.planit_id', request.params.id)
  ]).then(function(data) {
    response.json({ planits: data[0], tasks: data[1] });
  }).catch(next);
});

// U
route.put('/:id', function(request, response, next) {
  methods.getPermission(request.user.id).then(function(permission) {
    return knex('planits').where('id', request.params.id).then(function(planits) {
      var planit = planits[0];
      if (request.user.id == planit.member_id || request.user.role_name == 'admin') {
        return knex('planits').where('id', request.params.id).update(request.body).then(function() {
          response.json({ success: true });
        });
      } else {
        next('You do not have permission to perform this action');
      }
    });
  }).catch(next);
});

// D
route.delete('/:id', function(request, response, next) {
  methods.getPermission(request.user.id).then(function(permission) {
    return knex('planits').where('id', request.params.id).then(function(planits) {
      var planit = planits[0];
      if (request.user.id == planit.member_id || request.user.role_name == 'admin') {
        return knex('planits').where('id', request.params.id).del().then(function() {
          response.json({ success: true });
        });
      } else {
        next('You do not have permission to perform this action');
      }
    });
  }).catch(next);
});

// L
route.get('/', function(request, response, next) {
  var where = {};
  if (request.routeChain && request.routeChain.memberId) {
    where.member_id = request.routeChain.memberId;
  }
  knex('planits').where(where).orderBy('start_date', 'asc').then(function(planits) {
    response.json({ planits: planits });
  }).catch(next);
});
