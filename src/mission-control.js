function missionControl(id) {
  historyUpdate(viewServiceRecord, arguments);
  $.ajax({
    url: '/members/' + id,
    method: 'get'
  }),
  $.ajax({
    url: '/members/' + id + '/planits',
    method: 'get'
  })
  // ,$.ajax({
  //   url: '/members/' + id + '/planits/',
  //   method: 'get'
  // }).
  .done(function(members, planits) {
    var data = {
      member: members.members[0],
      // user: appvars.user,
      // deletable: appvars.user && (appvars.user.id == members.members[0].id || appvars.user.role_name == 'admin'),
      // bannable: appvars.user && appvars.user.role_name != 'normal' && appvars.user.id != members.members[0].id,
      // planits: planits.planit[0]
    };
    displayTemplate('main', 'dashboard', data);
  });
}
