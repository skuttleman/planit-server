function listPlanits() {
  $.ajax({
    url: '/planits',
    method: 'get'
  }).done(function(planits) {
    planits.user = appvars.user;
    displayTemplate('main', 'planits', planits);
  });
}

function viewPlanit(id) {
  $.ajax({
    url: '/planits/' + id,
    method: 'get'
  }).done(function(planits) {
    data = {
      planit: planits.planits[0],
      tasks: planits.tasks,
      user: appvars.user
    };
    displayTemplate('main', 'planit', data);
  });
}

function updatePlanit(id) {
  $.ajax({
    url: '/planits/' + id,
    method: 'get'
  }).done(function(planits) {
    displayTemplate('main', 'planitupdate', planits.planits[0]);
  });
}

function updatePlanitPut(event, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/planits/' + id,
    method: 'put',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewPlanit(id);
  });
}

function deletePlanit(id) {
  customConfirm('Are you sure you want to delete this planit?', function() {
    $.ajax({
      url: '/planits/' + id,
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
