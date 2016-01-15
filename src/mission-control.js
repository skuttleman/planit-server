function missionControl(id) {
  historyUpdate(viewServiceRecord, arguments);
  $.ajax({
    url: '/members/' + id,
    method: 'get'
  }).done(function(members) {
    data = {
      member: members.members[0],
      // skills: members.skills,
      // user: appvars.user,
      // deletable: appvars.user && (appvars.user.id == members.members[0].id || appvars.user.role_name == 'admin'),
      // bannable: appvars.user && appvars.user.role_name != 'normal' && appvars.user.id != members.members[0].id
    };
    displayTemplate('main', 'dashboard', data);
  });
}
