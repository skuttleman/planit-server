var knex = require('./db/knex');

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
  return [
    // general views
    { name: 'header', file: '/templates/header.hbs' },
    { name: 'footer', file: '/templates/footer.hbs' },
    { name: 'splashpage', file: '/templates/splash-page.hbs' },
    // members views
    { name: 'members', file: '/templates/members/members.hbs' },
    { name: 'member', file: '/templates/members/member.hbs' },
    { name: 'memberupdate', file: '/templates/members/member-update.hbs' },
    { name: 'missioncontrol', file: '/templates/mission-control/dashboard.hbs' },
    // planits views
    { name: 'planits', file: '/templates/planits/planits.hbs' },
    { name: 'planit', file: '/templates/planits/planit.hbs' },
    { name: 'planitupdate', file: '/templates/planits/planit-update.hbs' },
    // tasks views
    { name: 'task', file: '/templates/tasks/task.hbs' },
    { name: 'taskupdate', file: '/templates/tasks/task-update.hbs' },
    // proposal views
    { name: 'proposal', file: '/templates/proposals/proposal.hbs' }
  ];
}

module.exports = {
  getPermission: getPermission,
  chomp: chomp,
  partials: partials
};
