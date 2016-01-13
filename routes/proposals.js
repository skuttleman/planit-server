module.exports=require('express').Router();
//
// var route = require('express').Router();
// var proposals = require('./proposals');
// var knex = require('../db/knex');
// module.exports = route;
//
//
// route.use('/:id', function(request, response, next) {
//   request.routeChain = request.routeChain || {};
//   request.routeChain.proposalId = request.params.id;
//   next();
// });
//
// route.use('/:id/proposals', proposals);
//
//
//
// // C
// route.post('/', function(request, response, next) {
//   if (request.user && request.routeChain && request.routeChain.proposalId) {
//     var body = digest(request.body, request.routeChain.proposalId);
//     knex('proposals').returning('*').insert(body.body).then(function(proposals) {
//       if (body.description) {
//         return knex('proposal_details').insert({ id: proposals[0].id, description: description }).then(function() {
//           return Promise.resolve(proposals);
//         });
//       } else {
//         return Promise.resolve(proposals);
//       }
//     }).then(function(proposals) {
//       response.json({ success: true, proposals: proposals });
//     });
//   }
// });
//
// // R
// - LF - pretty sure this route is horked
// route.get('/:id', function(request, response, next) {
//   var where = {
//     'proposals.id': request.params.id
//   };
//   if (request.routeChain && request.routeChain.proposalId) where.proposal_id = request.routeChain.proposalId;
//   else response.json({ sucess: false });
//   Promise.all([
//     knex('proposals').select('proposals.id as proposal_id', 'proposals.*',)
//     knex('proposals').where({ id: where.proposal_id })
//   ]).then(function(data) {
//     var proposals = data[0];
//     var memberId = data[1][0].member_id;
//     console.log('memberid', memberId);
//     proposals.forEach(function(proposalId) {
//       proposal.id = proposalId.proposalId_id;
//       proposal.task_id = memberId;
//       delete proposal.proposal_id;
//     });
//     response.json({ success: true, proposals: proposals });
//   }).catch(function(err) {
//     console.log(err);
//   });
// });
//
// // U
// route.put('/:id', function(request, response, next) {
//   if (request.user.id) {
//     var body = digest(request.body);
//     Promise.all([
//       knex('proposals').where('id', request.params.id).update(body.body),
//       knex('proposal_details').where('id', request.params.id)
//     ]).then(function(data) {
//       var proposalId = data[0][0];
//       var skillDescription = data[1][0];
//       return updateOrCreate(description, skillDescription, request.params.id)
//       .then(function() {
//         return Promise.resolve(data[0]);
//       });
//     }).then(function(proposals) {
//       response.json({ success: true, proposals: proposals });
//     });
//   }
// });
//
// // D
// route.delete('/:id', function(request, response, next) {
//   if (request.user.id) {
//     knex('proposals').where({ id: request.params.id }).del().then(function() {
//       response.json({ success: true });
//     });
//   }
// });
//
// // L
// route.get('/', function(request, response, next) {
//   var where = {};
//   if (request.routeChain && request.routeChain.proposalId) where.proposal_id = request.routeChain.proposalId;
//   knex('proposals').select('proposals.id as proposalId_id', 'proposals.*', 'proposal_details.*', 'skills.*')
//   .where(where).then(function(proposals) {
//     proposals.forEach(function(proposalId) {
//       proposal.id = proposal.proposal_id;
//       delete proposal.proposal_id;
//     });
//     response.json({ success: true, proposals: proposals });
//   });
// });
//
// function digest(body, id) {
//   var ret = {
//     description: body.description
//   };
//   if (body.hasOwnProperty('id')) delete body.id;
//   if (body.hasOwnProperty('description')) delete body.description;
//   ret.body = body;
//   return ret;
// }
//
// function updateOrCreate(text, record, id) {
//   if (record && text) {
//     return knex('proposal_details').where({ id: record.id }).update({ description: text });
//   } else if (record) {
//     return knex('proposal_details').where({ id: record.id }).del();
//   } else if (text) {
//     return knex('proposal_details').where({ id: record.id }).insert({ id: id, description: text });
//   } else {
//     return Promise.resolve();
//   }
// }
