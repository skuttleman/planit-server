var route = require('express').Router();
var knex = require('../db/knex');
// var methods = require('../methods');
module.exports = route;

// get sent messages
route.get('/sent', function(request, response, next) {
  if (request.user) {
    Promise.all([
      knex('message_recipients')
      .select('members.*', 'messages.id as message_id', 'message_recipients.read_date')
      .innerJoin('members', 'message_recipients.recipient_id', 'members.id')
      .innerJoin('messages', 'message_recipients.message_id', 'messages.id')
      .where({ 'messages.sender_id': request.user.id }),
      knex('messages').where({ sender_id: request.user.id }).whereNotNull('sent_date')
      .where(function() {
        this.where('messages.deleted', false).orWhereNull('messages.deleted');
      })
    ]).then(linkMembers).then(function(messages) {
      response.json({ messages: messages });
    }).catch(next);
  } else {
    next('Permission denied');
  }
});

// get drafts
route.get('/drafts', function(request, response, next) {
  if (request.user) {
    Promise.all([
      knex('message_recipients').select('members.*', 'messages.id as message_id')
      .innerJoin('members', 'message_recipients.recipient_id', 'members.id')
      .innerJoin('messages', 'message_recipients.message_id', 'messages.id')
      .where({ 'messages.sender_id': request.user.id }),
      knex('messages').where({ sender_id: request.user.id }).whereNull('sent_date')
    ]).then(linkMembers).then(function(messages) {
      response.json({ messages: messages });
    });
  } else {
    next('Permission denied');
  }
});

// get received messages
route.get('/received', function(request, response, next) {
  if (request.user) {
    Promise.all([
      knex('message_recipients')
      .select('members.*', 'message_recipients.message_id', 'message_recipients.read_date')
      .innerJoin('members', 'message_recipients.recipient_id', 'members.id')
      .where({ 'message_recipients.recipient_id': request.user.id }),
      knex('messages').select('messages.*', 'message_recipients.read_date as read_date')
      .innerJoin('message_recipients', 'message_recipients.message_id', 'messages.id')
      .where({ 'message_recipients.recipient_id': request.user.id }).whereNotNull('sent_date')
      .where(function() {
        this.where('message_recipients.deleted', false).orWhereNull('message_recipients.deleted');
      })
    ]).then(linkMembers).then(function(messages) {
      response.json({ messages: messages });
    });
  } else {
    next('Permission denied');
  }
});

// C
route.post('/', function(request, response, next) {
  if (request.user) {
    var message = {
      sender_id: request.user.id,
      body: request.body.body,
      title: request.body.title,
      sent_date: request.body.send ? new Date() : null
    }, recipients = [].concat(JSON.parse(request.body.recipients));
    knex('messages').returning('*').insert(message)
    .then(updateRecipients(recipients)).then(function() {
      response.json({ success: true });
    }).catch(next);
  } else {
    next('Permission denied');
  }
});

// U
route.put('/:id', function(request, response, next) {
  // read
  if (request.user && request.body.read) {
    readMessage(request).then(function() {
      response.json({ success: true });
    }).catch(next);
  } else if (request.user) {
    updateMessage(request).then(function() {
      response.json({ success: true });
    }).catch(next);
  } else {
    next('Permission denied');
  }
});

// D
route.delete('/:id', function(request, response, next) {
  if (request.user) {
    knex('messages').where({ id: request.params.id }).then(function(messages) {
      var sent = messages[0];
      if (request.user.id == sent.sender_id) {
        if (sent.sent_date) {
          return knex('messages').update({ deleted: true }).where({ id: request.params.id });
        } else {
          return knex('messages').where({ id: request.params.id }).whereNull('sent_date').del();
        }
      } else {
        return knex('message_recipients').update({ deleted: true })
        .where({ recipient_id: request.user.id, message_id: request.params.id });
      }
    }).then(function() {
      response.json({ success: true });
    }).catch(next);
  } else {
    next('Permission denied');
  }
});

function updateRecipients(recipients) {
  return function(messages) {
    var records = recipients.map(function(recipient) {
      return { message_id: messages[0].id, recipient_id: recipient };
    });
    return knex('message_recipients').where({ message_id: messages[0].id })
    .del().then(function() {
      return knex('message_recipients').insert(records);
    });
  };
}

function linkMembers(results) {
  var members = results[0], messages = results[1];
  messages.forEach(function(message) {
    message.members = members.filter(function(member) {
      return member.message_id == message.id;
    });
  });
  return Promise.resolve(messages);
}

function readMessage(request) {
  return knex('message_recipients').update({ read_date: new Date() })
  .where({ message_id: request.params.id, recipient_id: request.user.id })
  .whereNull('read_date');
}

function updateMessage(request) {
  return knex('messages').where({ id: request.params.id }).then(function(messages) {
    if (request.user.id == messages[0].sender_id && !messages[0].sent_date) {
      var message = {
        body: request.body.body,
        title: request.body.title,
        sent_date: request.body.send ? new Date() : null
      }, recipients = [].concat(JSON.parse(request.body.recipients));
      return knex('messages').returning('*').update(message).where({ id: request.params.id })
      .then(updateRecipients(recipients));
    } else {
      return Promise.reject('Permission denied');
    }
  });
}
