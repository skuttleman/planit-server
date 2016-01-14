var knex = require('./db/knex');
var fs = require('fs');
var path = require('path');

function getPermission(memberId) {
  return knex('members').returning('roles.name').where('members.id', memberId).innerJoin('roles', 'members.role_id', 'roles.id')
  .then(function(roleNames) {
    return Promise.resolve(roleNames[0]);
  });
}

function chomp(array, field, search) {
  return array.filter(function(element) {
    return element[field] == search;
  })[0];
}

function partials() {
  return new Promise(function(resolve, reject) {
    walk('./public/templates', function(error, results) {
      if (error) reject(error);
      var mapped = results.map(function(filename) {
        var file = filename.split('public')[1];
        var name = file.split('/');
        name = name[name.length - 1].split('.hbs')[0].replace(/-/g, '');
        return { name: name, file: file };
      });
      resolve(mapped);
    });
  });
}

function readMember(id) {
  return Promise.all([
    knex('members').where({ id: id }),
    knex('skills').innerJoin('member_skills', 'skills.id', 'member_skills.skill_id')
    .where('member_skills.member_id', id)
  ]).then(function(data) {
    var members = data[0];
    var skills = data[1];
    return Promise.resolve({ members: members, skills: skills });
  });
}

function readTask(where) {
  return Promise.all([
    knex('tasks').select('tasks.id as task_id', 'tasks.*', 'skill_description.*', 'skills.name as skill_name')
    .leftJoin('skill_description', 'tasks.id', 'skill_description.id')
    .leftJoin('skills', 'tasks.skill_id', 'skills.id').where(where),
    readProposals({ task_id: where['tasks.id'] })
  ]).then(function(data) {
    var tasks = data[0], proposals = data[1].proposals;
    tasks[0].id = tasks[0].task_id;
    delete tasks[0].task_id;
    return statisticizeTask(tasks, proposals, where).then(function(tasks) {
      return Promise.resolve({ tasks: tasks, proposals: proposals });
    });
  });
}

function readProposals(where) {
  return knex('proposals').select('proposals.*', 'members.display_name', 'members.profile_image')
  .innerJoin('members', 'proposals.member_id', 'members.id').where(where)
  .orderBy('proposals.cost_estimate', 'asc').then(function(proposals) {
    return Promise.resolve({ proposals: proposals });
  });
}

module.exports = {
  getPermission: getPermission,
  chomp: chomp,
  partials: partials,
  readMember: readMember,
  readTask: readTask,
  readProposals: readProposals
};

function walk(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

function statisticizeTask(tasks, proposals, where) {
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
