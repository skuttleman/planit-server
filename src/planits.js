function createPlanit() {
  historyUpdate(createPlanit, arguments);
  $.ajax({
    url: '/types/planit_types',
    method: 'get'
  }).done(function(types) {
    appvars.planit_types = types.planit_types
    var data = {
      planit_types: appvars.planit_types,
      title: 'Create a planit (event)',
      states: appvars.states,
      startDate: formatDateInput(Date.now()),
      endDate: formatDateInput(Date.now())
    };
    displayTemplate('main', 'planitupdate', data);
    // addFormSubmitListener();
  });
}

function createPlanitPost(event) {
  if (event) event.preventDefault();
  validatePlanitForm(function() {
    var formData = getFormData('form');
    $.ajax({
      url: '/planits',
      method: 'post',
      data: formData,
      xhrFields: {
        withCredentials: true
      }
    }).done(function(data) {
      // $('#errorMessage').hide();
      viewPlanit(data.planits[0].id);
    }).fail(function(err) {
      // $('.error-message').text('Enter all fields.')
      // customAlert('All fields must be filled out in order to create a planit');
    });
  });
}

function listPlanits(memberId) {
  var url = memberId ? '/members/' + memberId + '/planits' : '/planits';
  historyUpdate(listPlanits, arguments);
  $.ajax({
    url: url,
    method: 'get'
  }).done(function(data) {
    data.user = appvars.user;
    data.planits.forEach(function(planit) {
      planit.startDate = formatDateShort(planit.start_date);
      planit.endDate = formatDateShort(planit.end_date);
    });
    displayTemplate('main', 'planits', data);
  });
}

function viewPlanit(id) {
  historyUpdate(viewPlanit, arguments);
  $.ajax({
    url: '/planits/' + id,
    method: 'get'
  }).done(function(planits) {
    appvars.planit = planits.planits[0];
    appvars.planit.startDate = formatDateLong(appvars.planit.start_date);
    appvars.planit.endDate = formatDateLong(appvars.planit.end_date);
    planits.tasks.forEach(function(task) {
      task.formattedTime = formatDateTimeShort(task.start_time);
    });
    data = {
      planit: appvars.planit,
      tasks: planits.tasks,
      user: appvars.user,
      editable: appvars.user && (appvars.user.id == planits.planits[0].member_id || appvars.user.role_name == 'admin'),
      deletable: appvars.user && (appvars.user.id == planits.planits[0].member_id || appvars.user.role_name !== 'normal'),
      formattedCurrency: formatCurrency(appvars.planit.budget)
    };
    displayTemplate('main', 'planit', data);
  });
}

function updatePlanit(id) {
  historyUpdate(updatePlanit, arguments);
  Promise.all([
    $.ajax({
      url: '/planits/' + id,
      method: 'get'
    }),
    $.ajax({
      url: '/types/planit_types',
      method: 'get'
    })
  ]).then(function(data) {
    appvars.planit_types = data[1].planit_types;
    var planit = data[0].planits[0];
    var data = {
      planit: planit,
      planit_types: data[1].planit_types,
      title: 'planit Update',
      update: true,
      states: appvars.states,
      category: findBy(appvars.planit_types, 'id', planit.planit_type_id).name,
      startDate: formatDateInput(planit.start_date),
      endDate: formatDateInput(planit.end_date)
    };
    displayTemplate('main', 'planitupdate', data);
  });
}

function updatePlanitPut(event, id) {
  if (event) event.preventDefault();
  validatePlanitForm(function() {
    var formData = getFormData('form');
    // console.log(formData);
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
      listPlanits();
    });
  });
}

function selectState(id) {
  $('.planit-state').val(appvars.states[id]);
  $('.ben-will-murder-you-if-remove-this-class-state').html(appvars.states[id] + '<span class="caret"></span>');
}

function selectPlanitType(id) {
  $('.planit-type').val(id);
  var planitType = findBy(appvars.planit_types, 'id', id).name;
  $('.ben-will-murder-you-if-remove-this-class-category').html(planitType + '<span class="caret"></span>');
}
