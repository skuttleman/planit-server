var appvars = {};

function pageLoaded() {
  $.ajax({
    url: '/auth',
    method: 'get'
  }).done(function(data) {
    if (data && data.user && data.user.is_banned) {
      logout();
      customAlert('You cannot login because your account has been banned.');
    } else {
      appvars.user = data.user;
      displayTemplate('header', 'header', data);
      if (data.user && data.user.firstLogin) {
        updateMember(data.user.id);
      } else {
        // TODO: go to mission control
      }
    }
  });

  displayTemplate('main', 'splashpage');

  displayTemplate('footer', 'footer', { secret: 'this is a secret', public: 'cool' });
}

function getFormData(selector) {
  return Array.prototype.reduce.call($(selector).find('input, textarea'), function(formData, element) {
    if (element.type == 'checkbox') {
      formData[element.name] = !!element.checked;
    } else {
      formData[element.name] = $(element).val();
    }
    return formData;
  }, {});
}

function customAlert(message) {
  window.alert(message);
}

function customConfirm(message, then) {
  if (window.confirm(message)) then();
}
