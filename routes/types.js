var route = require('express').Router();
var knex = require('../db/knex');

module.exports = route;

route.get('/skills', function(request, response) {
  knex('skills').then(function(skills) {
    response.json({ skills: skills });
  });
});

route.get('/planit_types', function(request, response) {
  knex('planit_types').then(function(skills) {
    response.json({ skills: skills });
  });
});
