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

module.exports = {
  getPermission: getPermission,
  chomp: chomp
};
