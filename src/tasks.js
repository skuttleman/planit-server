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
  ]).done(function(data) {
    appvars.planit = data[0].planits[0];
    appvars.task_types = data[1].task_types;
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
  $.ajax({
    url: '/planits/' + planitId + '/tasks/' + id,
    method: 'get'
  }).done(function(tasks) {
    data = {
      task: tasks.tasks[0],
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
  ]).then(function(data) {
    appvars.task_types = data[1].task_types;
    var task = data[0].tasks[0];
    var planit = data[2].planits[0];
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
    viewTask(id);
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
        displayTemplate('main', 'splashpage');
      }
    });
  });
}

// function selectTaskType(id) {
//   $('.task-type').val(id);
//   var taskType = findBy(appvars.task_types, 'id', id).name;
//   $('.category-btn').html(taskType + '<span class="caret"></span>');
// }
