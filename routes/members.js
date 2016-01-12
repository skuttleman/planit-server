var route = require('express').Router();
var messages = require('./messages');
var planits = require('./planits');
var reviews = require('./reviews');
var knex = require('../db/knex');
var methods = require('../methods');

module.exports = route;



route.use('/:id', function(request, response, next) {
  request.routeChain = request.routeChain || {};
  request.routeChain.memberId = request.params.id;
  next();
});

route.use('/:id/messages', messages);
route.use('/:id/planits', planits);
route.use('/:id/reviews', reviews);



// R
route.get('/:id', function(request, response, next) {
  Promise.all([
    knex('members').where({ id: request.params.id }),
    knex('skills').innerJoin('member_skills', 'skills.id', 'member_skills.skill_id')
    .where('member_skills.member_id', request.params.id)
  ]).then(function(data) {
    var members = data[0];
    var skills = data[1];
    response.json({ members: members, skills: skills });
  });
});

// U
route.put('/:id', function(request, response, next) {
  methods.getPermission(request.user.id).then(function(permission) {
    if (request.user.id == request.params.id || request.user.role_name == 'moderator' || request.user.role_name == 'admin') {
      var separatedData = separateMemberSkills(request.body);
      prepSkillsUpdate(request.params.id, separatedData).then(function() {
        response.json({ success: true });
      });
    } else {
      next('You do not have permission to perform this action');
    }
  }).catch(function(err) {
    next(err);
  });
});

// D
route.delete('/:id', function(request, response, next) {
  methods.getPermission(request.user.id).then(function(permission) {
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
    members.forEach(function(member) {
      var name = member.display_name.split(' ');
      member.display_name = [name[0], name[1][0]].join(' ');
    });
    response.json({ members: members });
  });
});

function separateMemberSkills(data) {
  return Object.keys(data).reduce(function(returnData, key) {
    if (key.match(/skill/gi)) {
      var skill = key.split('_')[1];
      returnData.skills.push({ skill_id: skill, val: String(data[key]) == 'true' });
    } else {
      returnData.member[key] = data[key];
    }
    return returnData;
  }, { member: {}, skills: [] });
}

function prepSkillsUpdate(memberId, data) {
  var ret = [knex('members').where({ id: memberId }).update(data.member)];
  return knex('member_skills').where({ member_id: memberId }).then(function(memberSkills) {
    data.skills.forEach(function(skill) {
      var hasSkill = !!memberSkills.filter(function(eachSkill) {
        return eachSkill.skill_id == skill.skill_id;
      }).length;
      if (skill.val && !hasSkill) {
        ret.push(knex('member_skills').insert({ skill_id: skill.skill_id, member_id: memberId }));
      } else if (!skill.val && hasSkill) {
        ret.push(knex('member_skills').where({ skill_id: skill.skill_id, member_id: memberId }).del());
      }
    });
    return Promise.all(ret);
  });
}
