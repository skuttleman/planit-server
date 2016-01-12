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
