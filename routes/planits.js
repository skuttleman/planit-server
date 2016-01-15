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
    console.log(request.body);
    knex('planits').returning('*').insert(request.body).then(function(planits) {
      console.log(request.body);
      response.json({ success: true, planits: planits });
    }).catch(next);
  } else {
    next('You must be logged in to perform this action');
  }
});

// R
route.get('/:id', function(request, response, next) {
  var where = {
    'planits.id': request.params.id
  };
  if (request.routeChain && request.routeChain.memberId) {
    where.member_id = request.routeChain.memberId;
  }
  route.readOne(where).then(function(data) {
    response.json(data);
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
  route.readAll(where).then(function(data) {
    response.json(data);
  }).catch(next);
});

route.readOne = function(where) {
  console.log(where);
  return Promise.all([
    knex('planits').select('planits.*', 'planit_types.name as planit_type_name')
    .innerJoin('planit_types', 'planits.planit_type_id', 'planit_types.id')
    .where(where)
    .orderBy('start_date', 'asc'),
    tasks.readAll({ planit_id: where['planits.id'] })
  ]).then(function(data) {
    var planits = data[0];
    var tasks = data[1].tasks;
    return knex('planits').sum('tasks.budget as allocated')
    .innerJoin('tasks', 'tasks.planit_id', 'planits.id')
    .where(where).then(function(allocated) {
      planits[0].allocated = allocated[0].allocated || 0;
      planits[0].budget_remaining = planits[0].budget - planits[0].allocated;
      return Promise.resolve({ planits: planits, tasks: tasks });
    });
  });
};

route.readAll = function(where) {
  return knex('planits').select('planits.*', 'planit_types.name as planit_type_name')
  .innerJoin('members', 'planits.member_id', 'members.id')
  .innerJoin('planit_types', 'planits.planit_type_id', 'planit_types.id')
  .where(where).where('end_date', '>=', new Date(Date.now())).whereNot('is_banned', true)
  .orderBy('start_date', 'asc')
  .then(function(planits) {
    return Promise.resolve({ planits: planits });
  });
};
