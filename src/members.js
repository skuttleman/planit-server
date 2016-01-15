function login() {
  window.open('/auth/linkedin', '_self');
}

function logout() {
  historyInit();
  appvars.user = undefined;
  $.get('/auth/logout').done(function() {
    displayTemplate('header', 'header');
    displayTemplate('main', 'splashpage');
    displayTemplate('footer', 'footer');
  });
}

function listMembers() {
  historyUpdate(listMembers, arguments);
  $.ajax({
    url: '/members',
    method: 'get'
  }).done(function(members) {
    members.user = appvars.user;
    displayTemplate('main', 'members', members);
  });
}

function viewServiceRecord(id) {
  historyUpdate(viewServiceRecord, arguments);
  Promise.all([
    $.ajax({
      url: '/members/' + id,
      method: 'get'
    }),
    $.ajax({
      url: '/members/' + id + '/planits',
      method: 'get'
    })
  ]).then(function(serverData) {
    appvars.member = serverData[0].members[0];
    appvars.planits = serverData[1].planits;
    appvars.planits.forEach(function(planit) {
      planit.formattedDate = formatDateShort(planit.start_date);
    });
    data = {
      member: appvars.member,
      planits: appvars.planits,
      skills: serverData[0].skills,
      user: appvars.user,
      deletable: appvars.user && (appvars.user.id == appvars.member.id || appvars.user.role_name == 'admin'),
      bannable: appvars.user && appvars.user.role_name != 'normal' && appvars.user.id != appvars.member.id
    };
    displayTemplate('main', 'member', data);
  });
}

function updateMember(id) {
  historyUpdate(updateMember, arguments);
  Promise.all([
    $.ajax({
      url: '/members/' + id,
      method: 'get'
    }),
    $.ajax({
      url: '/types/skills',
      method: 'get'
    })
  ]).then(function(serverData) {
    var allSkills = serverData[1].skills;
    var memberSkills = serverData[0].skills;

    allSkills.forEach(function(skill) {
      if (memberSkills.filter(function(memberSkill) {
        return skill.id == memberSkill.id;
      }).length) {
        skill.memberHas = true;
      } else {
        skill.memberHas = false;
      }
    });
    var data = {
      member: serverData[0].members[0],
      skills: allSkills
    }
    displayTemplate('main', 'memberupdate', data);
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
