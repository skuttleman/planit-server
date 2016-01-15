function validatePlanitForm(then) {
  if([!highlightTitle(),
      !highlightBudget(),
      !highlightDate(),
      !highlightPastDate(),
      !highlightAddress(),
      !highlightCity(),
      !highlightZip(),
      !highlightDescription].filter(function(item) {
        return !item;
      }).length) {
    } else {
      then();
    }
}

function validateTaskForm(then) {
  if(!highlightBudget() ||
      !highlightHeadCount() ||
      !highlightTime() ||
      !highlightPastTime()){
  } else {
    then();
  }
}

function validateProposalForm(then) {
  if([!highlightDescription(),
    !highlightBid()].filter(function(item) {
    return !item;
  }).length) {
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

// Used in planit form and proposal form

function highlightDescription(){
  if ($('.description').val()) {
    $('span[class="description-error error-text"]').remove();
    $('.description').removeClass('error-highlight');
    return true;
  } else {
    $('span[class="description-error error-text"]').remove();
    $('label[for="description"], label[for="details"]').append('<span class="description-error error-text"> Description Required.</span>');
    $('.description').removeClass('form-control').addClass('error-highlight').addClass('form-control');
  return false;
  }
}

function highlightCategory(){
//   var ben = ($('.ben-will-murder-you-if-remove-this-class-category'))
//   console.log($('.ben-will-murder-you-if-remove-this-class-category').text())
//   if (!!$('.ben-will-murder-you-if-remove-this-class-category').text().match(/category/gi)) {
//     $('span[class="planit-type planit-type-error error-text"]').remove();
//     $('.planit-type').removeClass('error-highlight');
//     return true;
//   }
//   else {
//     $('span[class="planit-type-error error-text"]').remove();
//     $('label[for="category"]').append('<span class="planit-type-error error-text"> Category Required.</span>');
//     $('.planit-type').addClass('error-highlight');
//   return false;
//   }
  // console.log(typeof $('.planit-type').val())
  // if($('.planit-type').val() >= 6 && $('.planit-type').val() <= 10) {
  //   $('span[class="planit-type planit-type-error error-text"]').remove();
  //   $('.planit-type').removeClass('error-highlight');
  //   return true;
  // }
  // else {
  //   $('span[class="planit-type-error error-text"]').remove();
  //   $('label[for="category"]').append('<span class="planit-type-error error-text"> Category Required.</span>');
  //   $('.planit-type').addClass('error-highlight');
  // return false;
  // }
  return true;
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
    $('label[for="budget"]').append('<span class="budget-error error-text"> Value must be a whole number more than zero.</span>');
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

// Validations specifically for tasks form

function highlightHeadCount() {
  if(parseInt($('.head-count').val()) > 0 && parseInt($('.head-count').val()) < 100 ){
    $('span[class="head-count-error error-text"]').remove();
    $('.head-count').removeClass('error-highlight');
    return true;
  } else {
    $('span[class="head-count-error error-text"]').remove();
    $('label[for="head_count"]').append('<span class="head-count-error error-text"> Number must be between 0 and 99.</span>');
    $('.head-count').removeClass('form-control').addClass('error-highlight').addClass('form-control');
    return false;
  }
}

function timeErrorOn() {
  $('span[class="time-error error-text"]').remove();
  $('label[for="start_time"], label[for="end_time"]').append('<span class="time-error error-text"> Cannot end earlier than start time or be in the past.</span>');
  $('label[for="start_time"], label[for="end_time"]').next().removeClass('form-control').addClass('error-highlight').addClass('form-control');
  return true;
}

function timeErrorOff() {
  $('span[class="time-error error-text"]').remove();
  $('label[for="start_time"]').next().removeClass('error-highlight');
  $('label[for="end_time"]').next().removeClass('error-highlight');
  return false;
}

function highlightTime() {
  var endTime = Date.parse($('.end-time').val());
  var startTime = Date.parse($('.start-time').val());
  console.log('start time: ' + startTime);
  console.log('end time: ' + endTime);
  if(endTime > startTime){
    timeErrorOff();
    return true;
  } else {
    timeErrorOn();
    return false;
  }
}

function highlightPastTime(){
  var currentTime = Date.parse(realDate(Date.now()));
  var startTime = Date.parse($('.start-time').val());
  if(startTime >= currentTime){
    timeErrorOff();
    return true;
  } else {
    timeErrorOn();
    return false;
  }
}

// Validations specific to proposals form

function highlightBid() {
  var digitsOnly = /^\d+(?:\d{1,2})?$/;
  var decimal = /'.'/;
  if(digitsOnly.test($('.bid').val())){
    $('span[class="bid-error error-text"]').remove();
    $('.bid').removeClass('error-highlight');
    return true;
  } else {
    $('span[class="bid-error error-text"]').remove();
    $('label[for="cost_estimate"]').append('<span class="bid-error error-text"> Bid must be a positive whole number or zero.</span>');
    $('.bid').removeClass('form-control').addClass('error-highlight').addClass('form-control');
    return false;
  }
}
