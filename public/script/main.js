function pageLoaded() {
  $.ajax({
    url: '/auth',
    method: 'get'
  }).done(function(data) {
    console.log(data);
    displayTemplate('header', 'header', data);
  });

  displayTemplate('footer', 'footer', { secret: 'this is a secret', public: 'cool' });
}

function login() {
  window.open('/auth/linkedin', '_self');
}
