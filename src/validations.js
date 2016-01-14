function validateForm(then) {
  // event.preventDefault();
  console.log('validate!');
  console.log(highlightBudget(), highlightDate(), highlightPastDate(), highlightZip());
  if(!highlightBudget() ||
      !highlightDate() ||
      !highlightPastDate() ||
      !highlightZip()) {
    // event.preventDefault();
  } else {
    then();
  }
}

function highlightBudget() {
  var digitsOnly = /^\d+(?:\d{1,2})?$/;
  var decimal = /'.'/;
  if(digitsOnly.test($('.budget').val())){
    $('span[class="budget-error error-text"]').remove();
    $('.budget').removeClass('error-highlight');
    return true;
  } else {
    $('span[class="budget-error error-text"]').remove();
    $('label[for="budget"]').append('<span class="budget-error error-text"> Value must a whole number more than zero.</span>');
    $('.budget').removeClass('form-control').addClass('error-highlight').addClass('form-control');
    return false;
  }
}

function dateErrorOn() {
  $('span[class="date-error error-text"]').remove();
  $('label[for="date"]').next().removeClass('error-highlight');
  return true;
}

function dateErrorOff() {
  $('span[class="date-error error-text"]').remove();
  $('label[for="date"]').append('<span class="date-error error-text"> Cannot end earlier than start date or be in the past.</span>');
  $('label[for="date"]').next().removeClass('form-control').addClass('error-highlight').addClass('form-control');
  return false;
}

function highlightDate() {
  if($('.end-date').val() >= $('.start-date').val()){
    dateErrorOff();
    return true;
  } else {
    dateErrorOn();
    return false;
  }
}

function highlightPastDate(){
  console.log(Date.parse($('.start-date').val()), Date.now());
  // var startDateRound = Date.parse($('.start-date').val());
  var startDate =formatDateInput(Date.parse($('.start-date').val()));
  var dateNow = formatDateInput(Date.now());
  console.log('start date ' + startDate);
  console.log('date now ' + dateNow);
  if(startDate >= dateNow){
    dateErrorOff();
    return true;
  } else {
    dateErrorOn();
    return false;
  }
}

function highlightZip() {
  if($('.zip').val().length === 5){
    $('span[class="zip-error error-text"]').remove();
    $('.zip').removeClass('error-highlight');
    return true;
  } else {
    $('span[class="zip-error error-text"]').remove();
    $('label[for="zipcode"]').append('<span class="zip-error error-text"> Zip Code must be 5 digits.</span>');
    $('.zip').removeClass('form-control').addClass('error-highlight').addClass('form-control');
    return false;
  }
}
