var route = require('express').Router();
var knex = require('../db/knex');

module.exports = route;



route.use('/:id', function(request, response, next) {
  request.routeChain = request.routeChain || {};
  request.routeChain.proposals = request.params.id;
  next();
});



// C
route.post('/', function(request, response, next) {
  if (request.user && request.routeChain && request.routeChain.taskId) {
    request.body.task_id = request.routeChain.taskId;
    request.body.member_id = request.user.id;
    knex('proposals').insert(request.body).then(function() {
      response.json({ success: true });
    });
  } else {
    next('You must be logged in to preform this action');
  }
});

// R
route.get('/:id', function(request, response, next) {
  knex('proposals').where({ id: request.params.id }).then(function(proposals) {
    response.json({ success: true, proposals: proposals });
  });
});

// U
route.put('/:id', function(request, response, next) {
  if (request.user) {
    connectProposalToPlanit.then(function(data) {
      var planit = data.planits[0], proposal = data.proposals[0], task = data.tasks[0];
      if (request.user.id == proposal.member_id || request.user.id == planit.member_id
      || request.user.role_name == 'admin') {
        knex('proposals').where({ id: request.params.id }).update(request.body);
      } else {
        next('You do not have permission to perform this action');
      }
    });
  } else {
    next('You must be logged in to perform this action');
  }
});

// D
route.delete('/:id', function(request, response, next) {
  if (request.user) {
    knex('proposals').where({ id: request.params.id }).then(function(proposals) {
      var proposal = proposals[0];
      if (request.user.id == proposal.member_id || request.user.role_name == 'admin') {
        knex('proposals').where({ id: request.params.id }).del().then(function() {
          response.json({ success: true });
        }).catch(function(err) {
          next(err);
        });
      } else {
        next('You do not have permission to perform this action');
      }
    });
  } else {
    next('You must be logged in to perform this action');
  }
});

// L
route.get('/', function(request, response, next) {
  if (request.routeChain && request.routeChain.taskId) {
    knex('proposals').where({ task_id: request.routeChain.taskId }).then(function(proposals) {
      response.json({ success: true, proposals: proposals });
    });
  }
});

function connectProposalToPlanit(id) {
  return knex('proposals').where({ id: id }).then(function(proposals) {
    return knex('tasks').where({ id: proposals[0].task_id }).then(function(tasks) {
      return Promise.resolve({ tasks: tasks, proposals: proposals });
    });
  }).then(function(data) {
    return knex('planits').where({ id: data.tasks[0].planit_id }).then(function(planits) {
      data.planits = planits;
      return Promise.resolve(data);
    });
  });
}
