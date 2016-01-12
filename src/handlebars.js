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
    { name: 'tasks', file: '/templates/tasks/tasks.hbs' },
    { name: 'task', file: '/templates/tasks/task.hbs' },
    { name: 'taskupdate', file: '/templates/tasks/task-update.hbs' }
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
