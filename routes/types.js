var route = require('express').Router();
var knex = require('../db/knex');

module.exports = route;

route.get('/skills', function(request, response) {
  knex('skills').then(function(skills) {
    response.json({ skills: skills });
  });
});