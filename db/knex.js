var config = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
};
var environment = process.env.NODE_ENV || 'development';
var knex = require('knex')(config[environment]);

module.exports = knex;
