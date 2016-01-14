var route = require('express').Router();
var proposals = require('./proposals');
var knex = require('../db/knex');
module.exports = route;


route.use('/:id', function(request, response, next) {
  request.routeChain = request.routeChain || {};
  request.routeChain.taskId = request.params.id;
  next();
});

route.use('/:id/proposals', proposals);



// C
route.post('/', function(request, response, next) {
  if (request.user && request.routeChain && request.routeChain.planitId) {
    var body = digest(request.body, request.routeChain.planitId);
    body.body.planit_id = request.routeChain.planitId;
    knex('tasks').returning('*').insert(body.body).then(function(tasks) {
      if (body.description) {
        return knex('skill_description').insert({ id: tasks[0].id, description: body.description }).then(function() {
          return Promise.resolve(tasks);
        });
      } else {
        return Promise.resolve(tasks);
      }
    }).then(function(tasks) {
      response.json({ success: true, tasks: tasks });
    }).catch(next);
  }
});

// R
route.get('/:id', function(request, response, next) {
  var where = {
    'tasks.id': request.params.id
  };
  if (request.routeChain && request.routeChain.planitId) {
    where.planit_id = request.routeChain.planitId;
  }
  route.readOne(where).then(function(data) {
    response.json(data);
  }).catch(next);
});

// U
route.put('/:id', function(request, response, next) {
  if (request.user.id) {
    var body = digest(request.body, request.params.id);
    Promise.all([
      knex('tasks').returning('*').where('id', request.params.id).update(body.body),
      knex('skill_description').where('id', request.params.id)
    ]).then(function(data) {
      var task = data[0][0];
      var skillDescription = data[1][0];
      return updateOrCreate(body.description, skillDescription, request.params.id)
      .then(function() {
        return Promise.resolve(data[0]);
      });
    }).then(function(tasks) {
      response.json({ success: true, tasks: tasks });
    }).catch(next);
  } else {
    next('You must be logged in');
  }
});

// D
route.delete('/:id', function(request, response, next) {
  if (request.user.id) {
    knex('tasks').where({ id: request.params.id }).del().then(function() {
      response.json({ success: true });
    }).catch(next);
  }
});

// L
route.get('/', function(request, response, next) {
  var where = {};
  if (request.routeChain && request.routeChain.planitId) where.planit_id = request.routeChain.planitId;
  route.readAll(where).then(function(data) {
    response.json(data);
  }).catch(next);
});

function digest(body, id) {
  var ret = {
    description: body.description
  };
  if (body.hasOwnProperty('id')) delete body.id;
  if (body.hasOwnProperty('description')) delete body.description;
  if (body.hasOwnProperty('skill_id')) body.skill_id = Number(body.skill_id) || undefined;
  ret.body = body;
  return ret;
}

function updateOrCreate(text, record, id) {
  if (record && text) {
    return knex('skill_description').where({ id: record.id }).update({ description: text });
  } else if (record) {
    return knex('skill_description').where({ id: record.id }).del();
  } else if (text) {
    return knex('skill_description').insert({ id: id, description: text });
  } else {
    return Promise.resolve();
  }
}

function statisticize(tasks, proposals, where) {
  return knex('tasks').sum('proposals.cost_estimate as allocated')
  .innerJoin('proposals', 'proposals.task_id', 'tasks.id')
  .where({ 'tasks.id': where['tasks.id'], is_accepted: true })
  .then(function(allocated) {
    tasks[0].allocated = allocated[0].allocated || 0;
    tasks[0].budget_remainging = tasks[0].budget - tasks[0].allocated;
    var accepted = proposals.filter(function(proposal) {
      return proposal.is_accepted;
    }).length;
    tasks[0].positions_remaining = tasks[0].head_count - accepted;
    return Promise.resolve(tasks);
  });
}

route.readOne = function(where) {
  return Promise.all([
    knex('tasks').select('tasks.id as task_id', 'tasks.*', 'skill_description.*', 'skills.name as skill_name')
    .leftJoin('skill_description', 'tasks.id', 'skill_description.id')
    .leftJoin('skills', 'tasks.skill_id', 'skills.id').where(where),
    proposals.readAll({ task_id: where['tasks.id'] })
  ]).then(function(data) {
    var tasks = data[0], proposals = data[1].proposals;
    tasks[0].id = tasks[0].task_id;
    delete tasks[0].task_id;
    return statisticize(tasks, proposals, where).then(function(tasks) {
      return Promise.resolve({ tasks: tasks, proposals: proposals });
    });
  })
};

route.readAll = function(where) {
  return knex('tasks').select('tasks.id as task_id', 'tasks.*', 'skill_description.*', 'skills.*')
  .leftJoin('skill_description', 'tasks.id', 'skill_description.id')
  .leftJoin('skills', 'tasks.skill_id', 'skills.id')
  .where(where).then(function(tasks) {
    tasks.forEach(function(task) {
      task.id = task.task_id;
      delete task.task_id;
    });
    return Promise.resolve({ tasks: tasks });
  });
};
