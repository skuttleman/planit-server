function createTask() {
  $.ajax({
    url: '/tasks/'
    method: 'post'
  }).done(function(types){
    appvars.task_types = types.task_types
  var data = {
    task_types: appvars.task_types
    title: 'Task Creation',
    headCount: headCount,
    startDate: formatDateInput(Date.now()),
    endDate: formatDateInput(Date.now())
    };
  displayTemplate('main', 'taskupdate', data);
  })
}

function createTaskPost(event, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/tasks',
    method: 'post',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewTask(data.tasks[0].id);
  }).fail(function(err){
    customAlert('All filed must be filled out to create a task')
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
      //? tasks: Tasks.tasks,
      user: appvars.user,
      editable: appvars.user && (appvars.user.id == tasks.tasks[0].member_id || appvars.user.role_name == 'admin'),
      deletable: appvars.user && (appvars.user.id == tasks.tasks[0].member_id || appvars.user.role_name !== 'normal')
    };
    displayTemplate('main', 'task', data);
  });
}

// May be a mistake 

function updateTask(id) {
  Promise.all([])
  $.ajax({
    url: '/tasks/' + id,
    method: 'get'
  }),
  $.ajax({
    url: '/tasks/task_types',
    method: 'get'
    })
  ]).then(function(data) {
    appvars.task_types = data[1].task_types;
    var task = data[0].tasks[0];
    var data = {
      tasks: task,
      task_types: data[1].task_types,
      title: 'Task Update',
      update: true,
      headCount: headCount,
      budget: budget,
      startDate: formatDateInput(task.start_date),
      endDate: formatDateInput(task.end_date)
    };
    displayTemplate('main', 'taskupdate', data);
  });
}


//Unsure if id is needed as well

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

function selectTaskType(id) {
  $('.task-type').val(id);
  var taskType = findBy(appvars.task_types, 'id', id).name;
  $('.category-btn').html(taskType + '<span class="caret"></span>');
}
