function pageLoaded() {
  displayTemplate('header', 'header');
  displayTemplate('footer', 'footer', { secret: 'this is a secret', public: 'cool' });
}

function login() {
  window.open('/auth/linkedin', '_self');
}
