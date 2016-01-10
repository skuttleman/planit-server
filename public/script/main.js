var appvars = {};

function pageLoaded() {
  $.ajax({
    url: '/auth',
    method: 'get'
  }).done(function(data) {
    appvars.user = data.user;
    displayTemplate('header', 'header', data);
  });

  displayTemplate('main', 'splashpage');

  displayTemplate('footer', 'footer', { secret: 'this is a secret', public: 'cool' });
}

function login() {
  window.open('/auth/linkedin', '_self');
}

function logout() {
  $.get('/auth/logout').done(function() {
    displayTemplate('header', 'header', { user: null });
    // ... re-display splash page
  });
}

function listMembers() {
  $.ajax({
    url: '/members',
    method: 'get'
  }).done(function(members) {
    members.user = appvars.user;
    displayTemplate('main', 'members', members);
  });
}

function viewServiceRecord(id) {
  $.ajax({
    url: '/members/' + id,
    method: 'get'
  }).done(function(members) {
    displayTemplate('main', 'member', { member: members.members[0], user: appvars.user });
  });
}

function updateMember(id) {
  $.ajax({
    url: '/members/' + id,
    method: 'get'
  }).done(function(members) {
    displayTemplate('main', 'memberupdate', members.members[0]);
  });
}

function updateMemberPut(event, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/members/' + id,
    method: 'put',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    displayTemplate('main', 'splashpage');
  });
}

function getFormData(selector) {
  return Array.prototype.reduce.call($(selector).children(), function(formData, element) {
    if (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') {
      formData[element.name] = $(element).val();
    }
    return formData;
  }, {});
}

function banMember(id, ban) {
  $.ajax({
    url: '/members/' + id,
    method: 'put',
    data: { is_banned: !ban },
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewServiceRecord(id);
  }).fail(function(err) {
    console.log(err);
  });
}

function reinstateMember(id) {
  banMember(id, true);
}
