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

Promise.all([
  // partials
  promisifyPartial({ name: 'header', file: '/templates/header.hbs' }),
  promisifyPartial({ name: 'footer', file: '/templates/footer.hbs' }),

  // general views
  promisifyPartial({ name: 'splashpage', file: '/templates/splash-page.hbs' }),

  // members views
  promisifyPartial({ name: 'members', file: '/templates/members/members.hbs' }),
  promisifyPartial({ name: 'member', file: '/templates/members/member.hbs' }),
  promisifyPartial({ name: 'memberupdate', file: '/templates/members/member-update.hbs' }),
  promisifyPartial({ name: 'missioncontrol', file: '/templates/members/mission-control.hbs' }),

  // planits views
  promisifyPartial({ name: 'planits', file: '/templates/planits/planits.hbs' }),
  promisifyPartial({ name: 'planit', file: '/templates/planits/planit.hbs' }),
  promisifyPartial({ name: 'planitupdate', file: '/templates/planits/planit-update.hbs' }),

  // tasks views
  promisifyPartial({ name: 'tasks', file: '/templates/tasks/tasks.hbs' }),
  promisifyPartial({ name: 'task', file: '/templates/tasks/task.hbs' }),
  promisifyPartial({ name: 'taskupdate', file: '/templates/tasks/task-update.hbs' }),

  // Document Ready?
  promiseToLoad()
]).then(function(datas) {
  pageLoaded();
});

Handlebars.registerHelper('compare', function(val1, val2, options) {
  if (val1 == val2) return options.fn(this);
  else return options.inverse(this);
});

function displayTemplate(selector, partial, data) {
  var template = Handlebars.compile(Handlebars.partials[partial]);
  $(selector).html(template(data));
}

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

function getFormData(selector) {
  return Array.prototype.reduce.call($(selector).find('input, textarea'), function(formData, element) {
    if (element.type == 'checkbox') {
      formData[element.name] = !!element.checked;
    } else {
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
  var data = {
    title: 'planit Update',
    submitMethod: 'createPlanitPost',
    submitText: 'Create'
  };
  displayTemplate('main', 'planitupdate', data);
}

function createPlanitPost(event, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  console.log(formData);
  // $.ajax({
  //   url: '/planits',
  //   method: 'post',
  //   data: formData,
  //   xhrFields: {
  //     withCredentials: true
  //   }
  // }).done(function(data) {
  //   viewPlanit(id);
  // });
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
    }),
    $.ajax({
      url: '/types/skills',
      method: 'get'
    })
  ]).then(function(data) {
    console.log(data);
    var data = {
      planit: data[0].planits[0],
      planit_types: data[1].planit_types,
      skills: data[2].skills,
      title: 'planit Update',
      submitMethod: 'updatePlanitPut',
      submitText: 'Update'
    };
    displayTemplate('main', 'planitupdate', data);
  });
}

function updatePlanitPut(event, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  console.log(formData);
  // $.ajax({
  //   url: '/planits/' + id,
  //   method: 'put',
  //   data: formData,
  //   xhrFields: {
  //     withCredentials: true
  //   }
  // }).done(function(data) {
  //   viewPlanit(id);
  // });
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

function listTasks() {
  $.ajax({
    url: '/tasks',
    method: 'get'
  }).done(function(tasks) {
    Tasks.user = appvars.user;
    displayTemplate('main', 'tasks', tasks);
  });
}

function viewTask(id) {
  $.ajax({
    url: '/tasks/' + id,
    method: 'get'
  }).done(function(tasks) {
    data = {
      task: tasks.tasks[0],
      tasks: Tasks.tasks,
      user: appvars.user
    };
    displayTemplate('main', 'task', data);
  });
}

function updateTask(id) {
  $.ajax({
    url: '/tasks/' + id,
    method: 'get'
  }).done(function(tasks) {
    displayTemplate('main', 'taskupdate', tasks.tasks[0]);
  });
}

function createTask(data){
  $.ajax({
    url: '/tasks/',
    method: 'post'
  }).done(function(task){
    console.log(task);
  });
}

function updateTaskPut(event, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/tasks/' + id,
    method: 'put',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewTask(id);
  });
}

function deleteTask(id) {
  customConfirm('Are you sure you want to delete this task?', function() {
    $.ajax({
      url: '/tasks/' + id,
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
