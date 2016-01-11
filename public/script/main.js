var appvars = {};

function pageLoaded() {
  $.ajax({
    url: '/auth',
    method: 'get'
  }).done(function(data) {
    if (data && data.user && data.user.is_banned) {
      logout();
      customAlert('You cannot login because your account has been banned.');
    } else {
      appvars.user = data.user;
      displayTemplate('header', 'header', data);
      if (data.user && data.user.firstLogin) {
        updateMember(data.user.id);
      } else {
        // TODO: go to mission control
      }
    }
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
    displayTemplate('main', 'splashpage');
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
    data = {
      member: members.members[0],
      user: appvars.user,
      deletable: appvars.user && (appvars.user.id == members.members[0].id || appvars.user.role_name == 'admin'),
      bannable: appvars.user && appvars.user.role_name != 'normal' && appvars.user.id != members.members[0].id
    };
    displayTemplate('main', 'member', data);
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
    viewServiceRecord(id);
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

function customAlert(message) {
  window.alert(message);
}

function customConfirm(message, then) {
  if (window.confirm(message)) then();
}

function deleteMember(id) {
  customConfirm('Are you sure you want to delete this member?', function() {
    $.ajax({
      url: '/members/' + id,
      method: 'delete',
      xhrFields: {
        withCredentials: true
      }
    }).done(function(data) {
      if (id == appvars.user.id) {
        logout();
      } else {
        displayTemplate('main', 'splashpage');
      }

    });
  });
}
