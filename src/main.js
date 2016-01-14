var appvars = {
  states: [
    "AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI",
    "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN",
    "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH",
    "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA",
    "WI", "WV", "WY"
  ]
};

function pageLoaded() {
  if (!appvars.history) historyInit();
  $.ajax({
    url: '/auth',
    method: 'get'
  }).done(function(data) {
    if (data && data.user && data.user.is_banned) {
      logout();
      customAlert('You cannot login because your account has been banned.');
    } else {
      appvars.user = data.user;
      if (data.user) {
        displayTemplate('header', 'header', data);
        // TODO: go to mission control
      } else {
        displayTemplate('header', 'header', data);
      }
      displayTemplate('footer', 'footer', { user: data.user });
    }
  });
  displayTemplate('main', 'splashpage');
}

function getFormData(selector) {
  return Array.prototype.reduce.call($(selector).find('input, textarea'), function(formData, element) {
    if (element.name && element.type == 'checkbox') {
      formData[element.name] = !!element.checked;
    } else if (element.name) {
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

function findBy(array, key, value) {
  return array.filter(function(element) {
    return element[key] == value;
  })[0];
}

function padTwo(number) {
  var string = String(number);
  while (string.length < 2) string = '0' + string;
  return string;
}

function month() {
  return [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
}

function day() {
  return [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
}

function formatDateInput(date) {
  var dateObject = new Date(date);
  var returnDate = [
    dateObject.getYear() + 1900,
    padTwo(dateObject.getMonth() + 1),
    padTwo(dateObject.getDate())
  ].join('-');
  return returnDate;
}

function formatDateTime(date) {
  var dateObject = new Date(date);
  var returnDate = [
    dateObject.getYear() + 1900,
    padTwo(dateObject.getMonth() + 1),
    padTwo(dateObject.getDate())
  ].join('-') +
  [
    padTwo(dateObject.getHours()),
    padTwo(dateObject.getMinutes())
  ].join(':');
  return returnDate;
}

function formatDateTimeInput(date) {
  var dateObject = new Date(date);
  var returnDate = [
    dateObject.getYear() + 1900,
    padTwo(dateObject.getMonth() + 1),
    padTwo(dateObject.getDate())
  ].join('-') + 'T' +
  [
    padTwo(dateObject.getHours()),
    padTwo(dateObject.getMinutes())
  ].join(':');
  return returnDate;
}

function formatDateShort(date) {
  var dateObject = new Date(date);
  var returnDate = [
    dateObject.getMonth() + 1,
    dateObject.getDate(),
    dateObject.getYear() + 1900,
  ].join('/');
  return returnDate;
}

function formatDateLong(date) {
  var dateObject = new Date(date);
  var returnDate = [
    day()[dateObject.getDay()],
    month()[dateObject.getMonth()],
    [
      dateObject.getDate(),
      dateObject.getYear() + 1900
    ].join(', '),
  ].join(' ');
  return returnDate;
}

function formatCurrency(budget) {
  return '$ ' + Number(budget).toFixed(0);
}
