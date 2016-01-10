function pageLoaded() {
  $.ajax({
    url: '/auth',
    method: 'get'
  }).done(function(data) {
    displayTemplate('header', 'header', data);
  });

  displayTemplate('footer', 'footer', { secret: 'this is a secret', public: 'cool' });
}

function login() {
  window.open('/auth/linkedin', '_self');
}

function logout() {
  $.get('/auth/logout').done(function() {
    displayTemplate('header', 'header', { user: null });
    // ... re-display splash page
  });
}
