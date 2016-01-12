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

function createTask(){
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
