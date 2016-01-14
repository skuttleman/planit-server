function validateForm(then) {
  // event.preventDefault();
  console.log(highlightTitle(), highlightBudget(), highlightDate(), highlightPastDate(), highlightZip());
  if(!highlightTitle() ||
      !highlightBudget() ||
      !highlightDate() ||
      !highlightPastDate() ||
      !highlightZip()) {
  } else {
    then();
  }
}

function highlightTitle(){
  if ($('.title').val()) {
    $('span[class="title-error error-text"]').remove();
    $('.title').removeClass('error-highlight');
    return true;
  } else {
    $('span[class="title-error error-text"]').remove();
    $('label[for="title"]').append('<span class="title-error error-text"> Title Required.</span>');
    $('.title').removeClass('form-control').addClass('error-highlight').addClass('form-control');
  return false;
  }
}

function highlightAddress(){
  if ($('.address').val()) {
    $('span[class="address-error error-text"]').remove();
    $('.address').removeClass('error-highlight');
    return true;
  } else {
    $('span[class="address-error error-text"]').remove();
    $('label[for="street_address"]').append('<span class="address-error error-text"> Address Required.</span>');
    $('.address').removeClass('form-control').addClass('error-highlight').addClass('form-control');
  return false;
  }
}

function highlightCity(){
  if ($('.city').val()) {
    $('span[class="city-error error-text"]').remove();
    $('.city').removeClass('error-highlight');
    return true;
  } else {
    $('span[class="city-error error-text"]').remove();
    $('label[for="city"]').append('<span class="city-error error-text"> City Required.</span>');
    $('.city').removeClass('form-control').addClass('error-highlight').addClass('form-control');
  return false;
  }
}

function highlightDescription(){
  if ($('.description').val()) {
    $('span[class="description-error error-text"]').remove();
    $('.description').removeClass('error-highlight');
    return true;
  } else {
    $('span[class="description-error error-text"]').remove();
    $('label[for="description"]').append('<span class="description-error error-text"> Description Required.</span>');
    $('.description').removeClass('form-control').addClass('error-highlight').addClass('form-control');
  return false;
  }
}

// function highlightCategory(){
//   if ($('.planit-type').val()) {
//     $('span[class="planit-type-error error-text"]').remove();
//     // $('.title').removeClass('error-highlight');
//     return true;
//   }
//   else {
//     $('span[class="planit-type-error error-text"]').remove();
//     $('label[for="category"]').append('<span class="planit-type-error error-text"> Category Required.</span>');
//     // $('.title').removeClass('form-control').addClass('error-highlight').addClass('form-control');
//   return false;
//   }
// }

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
  $('label[for="date"]').append('<span class="date-error error-text"> Cannot end earlier than start date or be in the past.</span>');
  $('label[for="date"]').next().removeClass('form-control').addClass('error-highlight').addClass('form-control');
  return true;
}

function dateErrorOff() {
  $('span[class="date-error error-text"]').remove();
  $('label[for="date"]').next().removeClass('error-highlight');
  return false;
}

function highlightDate() {
  console.log($('.end-date').val(),  $('.start-date').val());
  if($('.end-date').val() >= $('.start-date').val()){
    dateErrorOff();
    return true;
  } else {
    dateErrorOn();
    return false;
  }
}

function highlightPastDate(){
  var startDate = formatDateInput($('.start-date').val());
  var dateNow = formatDateInput(Date.now());
  console.log(startDate, dateNow);
  if(startDate >= dateNow){
    console.log('should be ok');
    dateErrorOff();
    return true;
  } else {
    console.log('should be bad');
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
