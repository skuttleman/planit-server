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
        return knex('skill_description').insert({ id: tasks[0].id, description: description }).then(function() {
          return Promise.resolve(tasks);
        });
      } else {
        return Promise.resolve(tasks);
      }
    }).then(function(tasks) {
      response.json({ success: true, tasks: tasks });
    }).catch(function(err) {
      response.status(404).send(err);
    });
  }
});

// R
route.get('/:id', function(request, response, next) {
  var where = {
    'tasks.id': request.params.id
  };
  if (request.routeChain && request.routeChain.planitId) where.planit_id = request.routeChain.planitId;
  else response.json({ sucess: false });
  Promise.all([
    knex('tasks').select('tasks.id as task_id', 'tasks.*', 'skill_description.*', 'skills.*')
    .leftJoin('skill_description', 'tasks.id', 'skill_description.id')
    .leftJoin('skills', 'tasks.skill_id', 'skills.id').where(where),
    knex('planits').where({ id: where.planit_id })
  ]).then(function(data) {
    var tasks = data[0];
    var memberId = data[1][0].member_id;
    tasks.forEach(function(task) {
      task.id = task.task_id;
      task.member_id = memberId;
      delete task.task_id;
    });
    response.json({ success: true, tasks: tasks });
  });
});

// U
route.put('/:id', function(request, response, next) {
  if (request.user.id) {
    var body = digest(request.body);
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
    });
  }
});

// D
route.delete('/:id', function(request, response, next) {
  if (request.user.id) {
    knex('tasks').where({ id: request.params.id }).del().then(function() {
      response.json({ success: true });
    });
  }
});

// L
route.get('/', function(request, response, next) {
  var where = {};
  if (request.routeChain && request.routeChain.planitId) where.planit_id = request.routeChain.planitId;
  knex('tasks').select('tasks.id as task_id', 'tasks.*', 'skill_description.*', 'skills.*')
  .leftJoin('skill_description', 'tasks.id', 'skill_description.id')
  .leftJoin('skills', 'tasks.skill_id', 'skills.id')
  .where(where).then(function(tasks) {
    tasks.forEach(function(task) {
      task.id = task.task_id;
      delete task.task_id;
    });
    response.json({ success: true, tasks: tasks });
  });
});

function digest(body, id) {
  var ret = {
    description: body.description
  };
  if (body.hasOwnProperty('id')) delete body.id;
  if (body.hasOwnProperty('description')) delete body.description;
  ret.body = body;
  return ret;
}

function updateOrCreate(text, record, id) {
  if (record && text) {
    return knex('skill_description').where({ id: record.id }).update({ description: text });
  } else if (record) {
    return knex('skill_description').where({ id: record.id }).del();
  } else if (text) {
    return knex('skill_description').where({ id: record.id }).insert({ id: id, description: text });
  } else {
    return Promise.resolve();
  }
}
