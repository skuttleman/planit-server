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

module.exports = {
  getPermission: getPermission,
  chomp: chomp,
  partials: partials
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
