var route = require('express').Router();
var knex = require('../db/knex');
var methods = require('../methods');

module.exports = route;



route.use('/:id', function(request, response, next) {
  request.routeChain = request.routeChain || {};
  request.routeChain.proposals = request.params.id;
  next();
});



// Accept Proposal
route.put('/:id/accept', function(request, response, next) {
  permissable(request.params.id).then(function(data) {
    if (request.user && (request.user.id == data.planit.member_id || request.user.role_name == 'admin')) {
      return acceptProposal(data.proposal).then(function() {
        response.json({ success: true, planitId: data.planit.id, taskId: data.proposal.task_id });
      });
    } else {
      next('You do not have permission to preform this action.');
    }
  }).catch(next);
});

// Reject Proposal
route.put('/:id/reject', function(request, response, next) {
  permissable(request.params.id).then(function(data) {
    if (request.user && (request.user.id == data.planit.member_id || request.user.role_name == 'admin')) {
      return rejectProposal(data.proposal).then(function() {
        response.json({ success: true });
      });
    } else {
      next('You do not have permission to preform this action.');
    }
  }).catch(next);
});

// C
route.post('/', function(request, response, next) {
  if (request.user && request.routeChain && request.routeChain.taskId) {
    request.body.task_id = request.routeChain.taskId;
    request.body.member_id = request.user.id;
    knex('proposals').insert(request.body).then(function() {
      response.json({ success: true });
    }).catch(next);
  } else {
    next('You must be logged in to preform this action');
  }
});

// R
route.get('/:id', function(request, response, next) {
  route.readOne({ 'proposals.id': request.params.id }).then(function(data) {
    response.json(data);
  }).catch(next);
});

// U
route.put('/:id', function(request, response, next) {
  if (request.user) {
    connectProposalToPlanit(request.params.id).then(function(data) {
      var planit = data.planits[0], proposal = data.proposals[0], task = data.tasks[0];
      if (request.user.id == proposal.member_id || request.user.id == planit.member_id
      || request.user.role_name == 'admin') {
        return knex('proposals').where({ id: request.params.id }).update(request.body);
      } else {
        next('You do not have permission to perform this action');
      }
    }).then(function() {
      response.json({ success: true });
    }).catch(next);
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
        return knex('proposals').where({ id: request.params.id }).del().then(function() {
          response.json({ success: true });
        });
      } else {
        next('You do not have permission to perform this action');
      }
    }).catch(next);
  } else {
    next('You must be logged in to perform this action');
  }
});

// L
route.get('/', function(request, response, next) {
  if (request.routeChain && request.routeChain.taskId) {
    route.readAll({ 'proposals.task_id': request.routeChain.taskId }).then(function(data) {
      response.json(data);
    }).catch(next);
  } else {
    respons.json({ success: false });
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

function permissable(id) {
  return knex('proposals').where({ id: id }).then(function(proposals) {
    return knex('planits').select('planits.*').innerJoin('tasks', 'planits.id', 'tasks.planit_id')
    .where({ 'tasks.id': proposals[0].task_id }).then(function(planits) {
      return Promise.resolve({
        proposal: proposals[0],
        planit: planits[0]
      });
    });
  });
}

function acceptProposal(proposal) {
  return methods.readTask({ 'tasks.id': proposal.task_id }).then(function(data) {
    var task = data.tasks[0];
    var proposals = data.proposals;
    var promises = proposals.map(function(eachProposal) {
      if (eachProposal.id == proposal.id) {
        return knex('proposals').where({ id: proposal.id }).update({ is_accepted: true });
      } else if (task.positions_remaining <= 1) {
        return rejectProposal(eachProposal);
      }
    });
    return Promise.all(promises);
  });
}

function rejectProposal(proposal) {
  return knex('proposals').where({ id: proposal.id }).update({ is_accepted: false });
}

route.readOne = function(where) {
  return knex('proposals').where(where).then(function(proposals) {
    return methods.readMember(proposals[0].member_id).then(function(members) {
      return Promise.resolve({ proposals: proposals, members: [members] });
    });
  });
};

route.readAll = function(where) {
  return methods.readProposals(where);
};
