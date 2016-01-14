function validateForm(event) {
  if(highlightBudget() === false || highlightDate() === false || highlightZip() === false) {
    event.preventDefault();
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
  if (true) {
    $('span[class="date-error error-text"]').remove();
    $('label[for="date"]').next().removeClass('error-highlight');
  }
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
  } else {
    dateErrorOn();
  }
}

function highlightPastDate(){
  if(Date.parse($('.start-date').val()) >= Date.now()){
    dateErrorOff();
  } else {
    dateErrorOn();
  }
}

function highlightZip() {
  if($('.zip').val().length === 5){
    $('span[class="zip-error error-text"]').remove();
    $('.zip').removeClass('error-highlight');
    return true;
  } else {
    $('span[class="planit-zip-error error-text"]').remove();
    $('label[for="zipcode"]').append('<span class="zip-error error-text"> Zip Code must be 5 digits.</span>');
    $('.zip').removeClass('form-control').addClass('error-highlight').addClass('form-control');
    return false;
  }
}
