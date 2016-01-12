(function() {
  var partials = [
    // general views
    { name: 'header', file: '/templates/header.hbs' },
    { name: 'footer', file: '/templates/footer.hbs' },
    { name: 'splashpage', file: '/templates/splash-page.hbs' },
    // members views
    { name: 'members', file: '/templates/members/members.hbs' },
    { name: 'member', file: '/templates/members/member.hbs' },
    { name: 'memberupdate', file: '/templates/members/member-update.hbs' },
    { name: 'missioncontrol', file: '/templates/members/mission-control.hbs' },
    // planits views
    { name: 'planits', file: '/templates/planits/planits.hbs' },
    { name: 'planit', file: '/templates/planits/planit.hbs' },
    { name: 'planitupdate', file: '/templates/planits/planit-update.hbs' },
    // tasks views
    { name: 'task', file: '/templates/tasks/task.hbs' },
    { name: 'taskupdate', file: '/templates/tasks/task-update.hbs' },
    // proposal views
    { name: 'proposal', file: '/templates/proposals/proposal.hbs' }

  ].map(promisifyPartial);

  partials.push(promiseToLoad());
  return Promise.all(partials);
})().then(pageLoaded);

function promisifyPartial(partial) {
  return new Promise(function(success, failure) {
    $.get(partial.file).done(function(text) {
      Handlebars.registerPartial(partial.name, text);
      success(true);
    }).fail(function(err) {
      failure(err);
    });
  });
}

function promiseToLoad() {
  return new Promise(function(success) {
    $(document).ready(function() {
      success();
    });
  });
}


Handlebars.registerHelper('compare', function(val1, val2, options) {
  if (val1 == val2) return options.fn(this);
  else return options.inverse(this);
});

function displayTemplate(selector, partial, data) {
  var template = Handlebars.compile(Handlebars.partials[partial]);
  $(selector).html(template(data));
}

var appvars = {
  states: [
    "AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI",
    "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN",
    "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH",
    "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA",
    "WI", "WV", "WY"
  ]
};

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
  displayTemplate('footer', 'footer');
}

function getFormData(selector) {
  return Array.prototype.reduce.call($(selector).find('input, textarea'), function(formData, element) {
    if (element.name && element.type == 'checkbox') {
      formData[element.name] = !!element.checked;
    } else if (element.name) {
      formData[element.name] = $(element).val();
    }
    return formData;
  }, {});
}

function customAlert(message) {
  window.alert(message);
}

function customConfirm(message, then) {
  if (window.confirm(message)) then();
}

function findBy(array, key, value) {
  return array.filter(function(element) {
    return element[key] == value;
  })[0];
}

function formatDateInput(date) {
  var dateObject = new Date(date);
  var returnDate = [
    dateObject.getYear() + 1900,
    padTwo(dateObject.getMonth() + 1),
    padTwo(dateObject.getDate())
  ].join('-');
  return returnDate;
}

function padTwo(number) {
  var string = String(number);
  while (string.length < 2) string = '0' + string;
  return string;
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
      skills: members.skills,
      user: appvars.user,
      deletable: appvars.user && (appvars.user.id == members.members[0].id || appvars.user.role_name == 'admin'),
      bannable: appvars.user && appvars.user.role_name != 'normal' && appvars.user.id != members.members[0].id
    };
    displayTemplate('main', 'member', data);
  });
}

function updateMember(id) {
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

function createPlanit() {
  $.ajax({
    url: '/types/planit_types',
    method: 'get'
  }).done(function(types) {
    appvars.planit_types = types.planit_types
    var data = {
      planit_types: appvars.planit_types,
      title: 'planit Creation',
      states: appvars.states,
      startDate: formatDateInput(Date.now()),
      endDate: formatDateInput(Date.now())
    };
    displayTemplate('main', 'planitupdate', data);
  });
}

function createPlanitPost(event) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/planits',
    method: 'post',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewPlanit(data.planits[0].id);
  }).fail(function(err) {
    customAlert('All fields must be filled out in order to create a planit');
  });
}

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
      user: appvars.user,
      editable: appvars.user && (appvars.user.id == planits.planits[0].member_id || appvars.user.role_name == 'admin'),
      deletable: appvars.user && (appvars.user.id == planits.planits[0].member_id || appvars.user.role_name !== 'normal')
    };
    displayTemplate('main', 'planit', data);
  });
}

function updatePlanit(id) {
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

function selectState(id) {
  $('.planit-state').val(appvars.states[id]);
  $('.state-btn').html(appvars.states[id] + '<span class="caret"></span>');
}

function selectPlanitType(id) {
  $('.planit-type').val(id);
  var planitType = findBy(appvars.planit_types, 'id', id).name;
  $('.category-btn').html(planitType + '<span class="caret"></span>');
}

function createTask(planitId) {
  Promise.all([
    $.ajax({
      url: '/planits/' + planitId,
      method: 'get'
    }),
    $.ajax({
      url: '/types/task_types',
      method: 'get'
    })
  ]).done(function(serverData) {
    appvars.planit = serverData[0].planits[0];
    appvars.task_types = serverData[1].task_types;
    var data = {
      planit: appvars.planit,
      title: 'Task Creation',
      startTime: formatDateInput(Date.now()),
      endTime: formatDateInput(Date.now())
    };
    // TODO: MODULARIZE FORM ROUTE
    displayTemplate('main', 'taskupdate', data);
  });
}

function createTaskPost(event, planitId) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/planits/' + planitId + '/tasks',
    method: 'post',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewTask(data.tasks[0].id);
  }).fail(function(err) {
    customAlert('All fields must be filled out to create a task');
  });
}

function viewTask(planitId, id) {
  Promise.all([
    $.ajax({
      url: '/planits/' + planitId + '/tasks/' + id,
      method: 'get'
    }),
    $.ajax({
      url: '/planits/',
      method: 'get'
    })
  ]).done(function(serverData) {
    appvars.planit = serverData[1].planits[0];
    data = {
      planit: planit,
      task: serverData[0].tasks[0],
      user: appvars.user
    };
    displayTemplate('main', 'task', data);
  });
}

function updateTask(planitId, id) {
  Promise.all([
    $.ajax({
      url: 'planits/' + planitId + '/tasks/' + id,
      method: 'get'
    }),
    $.ajax({
      url: '/types/task_types',
      method: 'get'
    }),
    $.ajax({
      url: '/planits',
      method: 'get'
    })
  ]).then(function(serverData) {
    appvars.task_types = serverData[1].task_types;
    var task = serverData[0].tasks[0];
    var planit = serverData[2].planits[0];
    var data = {
      task: task,
      planit: planit,
      task_types: appvars.task_types,
      title: 'Task Update',
      update: true,
      startDate: formatDateInput(task.start_date),
      endDate: formatDateInput(task.end_date)
    };
    displayTemplate('main', 'taskupdate', data);
  });
}

function updateTaskPut(event, planitId, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/planits/' + planitId + '/tasks/' + id,
    method: 'put',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewTask(planitId, id);
  });
}

function deleteTask(planitId, id) {
  customConfirm('Are you sure you want to delete this task?', function() {
    $.ajax({
      url: '/planits/' + planitId + '/tasks/' + id,
      method: 'delete',
      xhrFields: {
        withCredentials: true
      }
    }).done(function(data) {
      if (id == appvars.user.id) {
        logout();
      } else {
        viewPlanit(planitId);
      }
    });
  });
}

// function selectTaskType(id) {
//   $('.task-type').val(id);
//   var taskType = findBy(appvars.task_types, 'id', id).name;
//   $('.category-btn').html(taskType + '<span class="caret"></span>');
// }
