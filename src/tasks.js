function createTask(planitId) {
  historyUpdate(createTask, arguments);
  Promise.all([
    $.ajax({
      url: '/planits/' + planitId,
      method: 'get'
    }),
    $.ajax({
      url: '/types/skills',
      method: 'get'
    })
  ]).then(function(serverData) {
    appvars.planit = serverData[0].planits[0];
    appvars.skills = serverData[1].skills;
    appvars.skills.push({ id: 0, name: 'other' });
    var data = {
      planit: appvars.planit,
      title: 'Create a Task',
      skills: appvars.skills,
      hideDescription: ' hidden',
      startTime: formatDateTimeInput(appvars.planit.start_date),
      endTime: formatDateTimeInput(appvars.planit.start_date)
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
    $('#errorMessage').hide();
    viewTask(planitId, data.tasks[0].id);
  }).fail(function(err) {
    $('#errorMessage').text('Enter all fields. Empty fields or invalid');
  });
}

function viewTask(planitId, id) {
  historyUpdate(viewTask, arguments);
  Promise.all([
    $.ajax({
      url: '/planits/' + planitId + '/tasks/' + id,
      method: 'get'
    }),
    $.ajax({
      url: '/planits/' + planitId,
      method: 'get'
    })
  ]).then(function(serverData) {
    appvars.planit = serverData[1].planits[0];
    appvars.task = serverData[0].tasks[0];
    appvars.proposals = serverData[0].proposals;
    data = {
      planit: appvars.planit,
      task: appvars.task,
      proposals: appvars.proposals,
      approvedProposals: appvars.proposals.filter(function(proposal) {
        return proposal.is_accepted;
      }),
      pendingProposals: appvars.proposals.filter(function(proposal) {
        return proposal.is_accepted !== true && proposal.is_accepted !== false;
      }),
      user: appvars.user,
      editable: appvars.user && (appvars.planit.member_id == appvars.user.id || appvars.user.role_name == 'admin'),
      submittable: appvars.user && appvars.planit.member_id != appvars.user.id
    };
    console.log(data);
    displayTemplate('main', 'task', data);
  });
}

function updateTask(planitId, id) {
  historyUpdate(updateTask, arguments);
  Promise.all([
    $.ajax({
      url: 'planits/' + planitId + '/tasks/' + id,
      method: 'get'
    }),
    $.ajax({
      url: '/types/skills',
      method: 'get'
    }),
    $.ajax({
      url: '/planits/' + planitId,
      method: 'get'
    })
  ]).then(function(serverData) {
    appvars.skills = serverData[1].skills;
    var task = serverData[0].tasks[0];
    appvars.skills.push({ id:0, name: 'other' });
    var planit = serverData[2].planits[0];
    var data = {
      task: task,
      planit: planit,
      skills: appvars.skills,
      skill: task.skill_name || 'other',
      hideDescription: task.skill_name ? ' hidden' : '',
      title: 'Update Task',
      update: true,
      startTime: formatDateTimeInput(task.start_time),
      endTime: formatDateTimeInput(task.end_time)
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

function selectSkill(id) {
  $('.skill').val(id);
  var skill = findBy(appvars.skills, 'id', id).name;
  $('.skill-btn').html(skill + '<span class="caret"></span>');
  var $description = $('.optional-description');
  if (skill == 'other') {
    $description.removeClass('hidden');
  } else {
    $description.addClass('hidden');
    $description.val('');
  }
}
