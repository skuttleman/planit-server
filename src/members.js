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
      skills: members.skills,
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

function banMember(id, restore) {
  $.ajax({
    url: '/members/' + id,
    method: 'put',
    data: { is_banned: !restore },
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewServiceRecord(id);
  });
}

function reinstateMember(id) {
  banMember(id, true);
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
