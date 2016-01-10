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

  // views
  promisifyPartial({ name: 'splashpage', file: '/templates/splash-page.hbs' }),

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
