(function() {
  $.get('/partials').done(function(partials) {
    var promises = partials.map(promisifyPartial);
    promises.push(promiseToLoad());
    Promise.all(promises).then(pageLoaded);
  });
})();

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


Handlebars.registerHelper('compare', function(val1, val2, options) {
  if (val1 == val2) return options.fn(this);
  else return options.inverse(this);
});

function displayTemplate(selector, partial, data) {
  var template = Handlebars.compile(Handlebars.partials[partial]);
  $(selector).html(template(data));
}

function historyBack() {
  if (appvars.historyPosition > 0) {
    historyLoad(--appvars.historyPosition);
    updateHistoryButtons();
  }
}

function historyNext() {
  if (appvars.historyPosition < appvars.history.length - 1) {
    historyLoad(++appvars.historyPosition);
    updateHistoryButtons();
  }
}

function historyUpdate(process, params) {
  if (appvars.historyBlockUpdate) {
    appvars.historyBlockUpdate = false;
  } else {
    appvars.history.length = appvars.historyPosition + 1;
    appvars.history.push({ process: process, params: params });
    appvars.historyPosition++;
    updateHistoryButtons();
  }
}

function historyInit() {
  appvars.history = [{ process: pageLoaded, params: {} }];
  appvars.historyPosition = 0;
  updateHistoryButtons();
}

function historyLoad(position) {
  appvars.historyBlockUpdate = true;
  var goTo = appvars.history[position];
  goTo.process.apply(null, goTo.params);
}

function updateHistoryButtons() {
  if (appvars.historyPosition == 0) {
    // back button disabled
  } else {
    // back button enabled
  }
  if (appvars.historyPosition < appvars.history.length - 1) {
    // next button enabled
  } else {
    // next button disabled
  }
}

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
  var dateObject = realDate(date);
  var returnDate = [
    dateObject.getYear() + 1900,
    padTwo(dateObject.getMonth() + 1),
    padTwo(dateObject.getDate())
  ].join('-');
  return returnDate;
}

function formatDateTime(date) {
  // var dateObject = new Date(date);
  var dateObject = realDate(date);
  var returnDate = [
    dateObject.getYear() + 1900,
    padTwo(dateObject.getMonth() + 1),
    padTwo(dateObject.getDate())
  ].join('-') + ' ' +
  [
    padTwo(dateObject.getHours()),
    padTwo(dateObject.getMinutes())
  ].join(':');
  return returnDate;
}

function formatDateTimeLong(date) {
  // var dateObject = new Date(date);
  var dateObject = realDate(date);
  var returnDate = [
    day()[dateObject.getDay()],
    month()[dateObject.getMonth()],
    [
      dateObject.getDate(),
      dateObject.getYear() + 1900
    ].join(', '),
    [
      dateObject.getHours() % 12 || 12,
      padTwo(dateObject.getMinutes())
    ].join(':'),
    dateObject.getHours() >= 12 ? 'PM' : 'AM'
  ].join(' ');
  return returnDate;
}

function formatDateTimeInput(date) {
  // var dateObject = new Date(date);
  var dateObject = realDate(date);
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
  var dateObject = realDate(date);
  var returnDate = [
    dateObject.getMonth() + 1,
    dateObject.getDate(),
    dateObject.getYear() + 1900,
  ].join('/');
  return returnDate;
}

function formatDateLong(date) {
  var dateObject = realDate(date);
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

function realDate(date) {
  return new Date(
    (new Date(date).getTimezoneOffset() * 60000) +
    new Date(date).getTime()
  );
}

function login() {
  window.open('/auth/linkedin', '_self');
}

function logout() {
  historyInit();
  appvars.user = undefined;
  $.get('/auth/logout').done(function() {
    displayTemplate('header', 'header');
    displayTemplate('main', 'splashpage');
    displayTemplate('footer', 'footer');
  });
}

function listMembers() {
  historyUpdate(listMembers, arguments);
  $.ajax({
    url: '/members',
    method: 'get'
  }).done(function(members) {
    members.user = appvars.user;
    displayTemplate('main', 'members', members);
  });
}

function viewServiceRecord(id) {
  historyUpdate(viewServiceRecord, arguments);
  $.ajax({
    url: '/members/' + id,
    method: 'get'
  }).done(function(members) {
    data = {
      member: members.members[0],
      skills: members.skills,
      user: appvars.user,
      deletable: appvars.user && (appvars.user.id == members.members[0].id || appvars.user.role_name == 'admin'),
      bannable: appvars.user && appvars.user.role_name != 'normal' && appvars.user.id != members.members[0].id
    };
    displayTemplate('main', 'member', data);
  });
}

function updateMember(id) {
  historyUpdate(updateMember, arguments);
  Promise.all([
    $.ajax({
      url: '/members/' + id,
      method: 'get'
    }),
    $.ajax({
      url: '/types/skills',
      method: 'get'
    })
  ]).then(function(serverData) {
    var allSkills = serverData[1].skills;
    var memberSkills = serverData[0].skills;

    allSkills.forEach(function(skill) {
      if (memberSkills.filter(function(memberSkill) {
        return skill.id == memberSkill.id;
      }).length) {
        skill.memberHas = true;
      } else {
        skill.memberHas = false;
      }
    });
    var data = {
      member: serverData[0].members[0],
      skills: allSkills
    }
    displayTemplate('main', 'memberupdate', data);
  });
}

function updateMemberPut(event, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/members/' + id,
    method: 'put',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewServiceRecord(id);
  });
}

function banMember(id, restore) {
  $.ajax({
    url: '/members/' + id,
    method: 'put',
    data: { is_banned: !restore },
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewServiceRecord(id);
  });
}

function reinstateMember(id) {
  banMember(id, true);
}

function deleteMember(id) {
  customConfirm('Are you sure you want to delete this member?', function() {
    $.ajax({
      url: '/members/' + id,
      method: 'delete',
      xhrFields: {
        withCredentials: true
      }
    }).done(function(data) {
      if (id == appvars.user.id) {
        logout();
      } else {
        displayTemplate('main', 'splashpage');
      }
    });
  });
}

function createPlanit() {
  historyUpdate(createPlanit, arguments);
  $.ajax({
    url: '/types/planit_types',
    method: 'get'
  }).done(function(types) {
    appvars.planit_types = types.planit_types
    var data = {
      planit_types: appvars.planit_types,
      title: 'Create a planit (event)',
      states: appvars.states,
      startDate: formatDateInput(Date.now()),
      endDate: formatDateInput(Date.now())
    };
    displayTemplate('main', 'planitupdate', data);
    // addFormSubmitListener();
  });
}

function createPlanitPost(event) {
  if (event) event.preventDefault();
  validateForm(function() {
    var formData = getFormData('form');
    $.ajax({
      url: '/planits',
      method: 'post',
      data: formData,
      xhrFields: {
        withCredentials: true
      }
    }).done(function(data) {
      $('#errorMessage').hide();
      viewPlanit(data.planits[0].id);
    }).fail(function(err) {
      $('.error-message').text('Enter all fields.')
      // customAlert('All fields must be filled out in order to create a planit');
    });
  });
}

function listPlanits(memberId) {
  var url = memberId ? '/members/' + memberId + '/planits' : '/planits';
  historyUpdate(listPlanits, arguments);
  $.ajax({
    url: url,
    method: 'get'
  }).done(function(data) {
    data.user = appvars.user;
    data.planits.forEach(function(planit) {
      planit.startDate = formatDateShort(planit.start_date);
      planit.endDate = formatDateShort(planit.end_date);
    });
    displayTemplate('main', 'planits', data);
  });
}

function viewPlanit(id) {
  historyUpdate(viewPlanit, arguments);
  $.ajax({
    url: '/planits/' + id,
    method: 'get'
  }).done(function(planits) {
    appvars.planit = planits.planits[0];
    appvars.planit.startDate = formatDateLong(appvars.planit.start_date);
    appvars.planit.endDate = formatDateLong(appvars.planit.end_date);
    data = {
      planit: appvars.planit,
      tasks: planits.tasks,
      user: appvars.user,
      editable: appvars.user && (appvars.user.id == planits.planits[0].member_id || appvars.user.role_name == 'admin'),
      deletable: appvars.user && (appvars.user.id == planits.planits[0].member_id || appvars.user.role_name !== 'normal'),
      formattedCurrency: formatCurrency(appvars.planit.budget)
    };
    displayTemplate('main', 'planit', data);
  });
}

function updatePlanit(id) {
  historyUpdate(updatePlanit, arguments);
  Promise.all([
    $.ajax({
      url: '/planits/' + id,
      method: 'get'
    }),
    $.ajax({
      url: '/types/planit_types',
      method: 'get'
    })
  ]).then(function(data) {
    appvars.planit_types = data[1].planit_types;
    var planit = data[0].planits[0];
    var data = {
      planit: planit,
      planit_types: data[1].planit_types,
      title: 'planit Update',
      update: true,
      states: appvars.states,
      category: findBy(appvars.planit_types, 'id', planit.planit_type_id).name,
      startDate: formatDateInput(planit.start_date),
      endDate: formatDateInput(planit.end_date),
      formattedCurrency: Number(planit.budget).toFixed(2)
    };
    console.log(appvars.budget);
    displayTemplate('main', 'planitupdate', data);
  });
}

function updatePlanitPut(event, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  // console.log(formData);
  $.ajax({
    url: '/planits/' + id,
    method: 'put',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewPlanit(id);
  });
}

function deletePlanit(id) {
  customConfirm('Are you sure you want to delete this planit?', function() {
    $.ajax({
      url: '/planits/' + id,
      method: 'delete',
      xhrFields: {
        withCredentials: true
      }
    }).done(function(data) {
      listPlanits();
    });
  });
}

function selectState(id) {
  $('.planit-state').val(appvars.states[id]);
  $('.ben-will-murder-you-if-remove-this-class-state').html(appvars.states[id] + '<span class="caret"></span>');
}

function selectPlanitType(id) {
  $('.planit-type').val(id);
  var planitType = findBy(appvars.planit_types, 'id', id).name;
  $('.ben-will-murder-you-if-remove-this-class-category').html(planitType + '<span class="caret"></span>');
}

function createProposal(planitId, taskId) {
  historyUpdate(createProposal, arguments);
  $.ajax({
    url: '/planits/' + planitId + '/tasks/' + taskId,
    method: 'get'
  }).done(function(details){
    console.log(taskId)
    appvars.task = details.tasks[0]
    var data = {
      task: appvars.task,
      taskId: appvars.task.id,
      title: 'Proposal Creation',
      planitId: planitId
    };
    displayTemplate('main', 'proposalupdate', data);
  })
}

function createProposalPost(event, planitId, taskId) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/planits/' + planitId + '/tasks/' + taskId + '/proposals/',
    method: 'post',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewTask(planitId, taskId);
  }).fail(function(err){
    customAlert('All fields must be filled out to create a proposal')
  });
}

// function listProposals() {
//   historyUpdate(listProposals, arguments);
//   $.ajax({
//     url: '/proposals',
//     method: 'get'
//   }).done(function(proposals) {
//     Proposals.user = appvars.user;
//     displayTemplate('main', 'proposals', proposals);
//   });
// }

function viewProposal(planitId, taskId, id) {
  historyUpdate(viewProposal, arguments);
  Promise.all([
    $.ajax({
      url: '/proposals/' + id,
      method: 'get'
    })
  ]).then(function(proposals) {
    return Promise.all([
      $.ajax({
        url: '/members/' + proposals[0].proposals[0].member_id,
        method: 'get'
      }),
      $.ajax({
        url: '/planits/' + planitId,
        method: 'get'
      })
    ]).then(function(data) {
      return Promise.resolve({
        member: data[0].members[0],
        skills: data[0].skills,
        proposal: proposals[0].proposals[0],
        planit: data[1].planits[0]
      });
    });
  }).then(function(serverData) {
    data = {
      proposal: serverData.proposal,
      member: serverData.member,
      skills: serverData.skills,
      planit: serverData.planit,
      taskId: taskId,
      user: appvars.user,
      formattedCurrency: formatCurrency(serverData.proposal.cost_estimate),
      respondable: appvars.user && (appvars.user.id == serverData.planit.member_id || appvars.user.role_name == 'admin') && !serverData.proposal.is_accepted,
      editable: appvars.user && (appvars.user.id == serverData.proposal.member_id || appvars.user.role_name == 'admin'),
      deletable: appvars.user && (appvars.user.id == serverData.proposal.member_id || appvars.user.role_name !== 'normal')
    };
    displayTemplate('main', 'proposal', data);
  });
}

function updateProposal(planitId, taskId, id) {
  historyUpdate(updateProposal, arguments);
  Promise.all([
  $.ajax({
    url: '/planits/' + planitId + '/tasks/' + taskId + '/proposals/' + id,
    method: 'get'
  })
  ]).then(function(serverData) {
    appvars.proposal = serverData[0].proposals[0];
    var proposal = serverData[0].proposals[0];
    var data = {
      planitId: planitId,
      taskId: taskId,
      title: 'Proposal Update',
      proposal: appvars.proposal,
      update: true,
    };
    displayTemplate('main', 'proposalupdate', data);
  });
}

function updateProposalPut(event, planitId, taskId, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/planits/' + planitId + '/tasks/' + taskId + '/proposals/' + id,
    method: 'put',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewProposal(planitId, taskId, id);
  });
}

function deleteProposal(planitId, taskId, id) {
  customConfirm('Are you sure you want to delete this proposal?', function() {
    $.ajax({
      url: '/planits/' + planitId + '/tasks/' + taskId + '/proposals/' + id,
      method: 'delete',
      xhrFields: {
        withCredentials: true
      }
    }).done(function(data) {
      if (id == appvars.user.id) {
        logout();
      } else {
        viewTask(planitId, taskId);
      }
    });
  });
}

function setProposalStatus(id, status){
  $.ajax({
    url: '/proposals/' + id + (status ? '/accept' : '/reject'),
    method: 'put',
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    console.log(data);
    viewTask(data.planitId, data.taskId);
  }).fail(customAlert);
}

// $(document).ready(function() {
//     console.log( "ready!" );
// });



$(".createplanit").click(function() {
	var title = $('.titletest');
	if(!title.val()) {
		alert('nice')
    }
    else{
    	alert('enter a title fool')
    }
})

function createTask(planitId) {
  historyUpdate(createTask, arguments);
  Promise.all([
    $.ajax({
      url: '/planits/' + planitId,
      method: 'get'
    }),
    $.ajax({
      url: '/types/skills',
      method: 'get'
    })
  ]).then(function(serverData) {
    appvars.planit = serverData[0].planits[0];
    appvars.skills = serverData[1].skills;
    appvars.skills.push({ id: 0, name: 'other' });
    var data = {
      planit: appvars.planit,
      title: 'Create a Task',
      skills: appvars.skills,
      hideDescription: ' hidden',
      startTime: formatDateTimeInput(appvars.planit.start_date),
      endTime: formatDateTimeInput(appvars.planit.start_date)
    };
    // TODO: MODULARIZE FORM ROUTE
    displayTemplate('main', 'taskupdate', data);
  });
}

function createTaskPost(event, planitId) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/planits/' + planitId + '/tasks',
    method: 'post',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    $('#errorMessage').hide();
    viewTask(planitId, data.tasks[0].id);
  }).fail(function(err) {
    $('#errorMessage').text('Enter all fields. Empty fields or invalid');
  });
}

function viewTask(planitId, id) {
  historyUpdate(viewTask, arguments);
  Promise.all([
    $.ajax({
      url: '/planits/' + planitId + '/tasks/' + id,
      method: 'get'
    }),
    $.ajax({
      url: '/planits/' + planitId,
      method: 'get'
    })
  ]).then(function(serverData) {
    appvars.planit = serverData[1].planits[0];
    appvars.task = serverData[0].tasks[0];
    appvars.proposals = serverData[0].proposals;
    data = {
      planit: appvars.planit,
      task: appvars.task,
      proposals: appvars.proposals,
      approvedProposals: appvars.proposals.filter(function(proposal) {
        return proposal.is_accepted;
      }),
      pendingProposals: appvars.proposals.filter(function(proposal) {
        return proposal.is_accepted !== true && proposal.is_accepted !== false;
      }),
      formattedCurrency: formatCurrency(appvars.task.budget),
      user: appvars.user,
      startTime: formatDateTimeLong(appvars.task.start_time),
      endTime: formatDateTimeLong(appvars.task.end_time),
      editable: appvars.user && (appvars.planit.member_id == appvars.user.id || appvars.user.role_name == 'admin'),
      submittable: appvars.user && appvars.planit.member_id != appvars.user.id && appvars.task.positions_remaining
    };
    displayTemplate('main', 'task', data);
  });
}

function updateTask(planitId, id) {
  historyUpdate(updateTask, arguments);
  Promise.all([
    $.ajax({
      url: 'planits/' + planitId + '/tasks/' + id,
      method: 'get'
    }),
    $.ajax({
      url: '/types/skills',
      method: 'get'
    }),
    $.ajax({
      url: '/planits/' + planitId,
      method: 'get'
    })
  ]).then(function(serverData) {
    appvars.skills = serverData[1].skills;
    var task = serverData[0].tasks[0];
    appvars.skills.push({ id:0, name: 'other' });
    var planit = serverData[2].planits[0];
    var data = {
      task: task,
      planit: planit,
      skills: appvars.skills,
      skill: task.skill_name || 'other',
      hideDescription: task.skill_name ? ' hidden' : '',
      title: 'Update Task',
      update: true,
      startTime: formatDateTimeInput(task.start_time),
      endTime: formatDateTimeInput(task.end_time)
    };
    displayTemplate('main', 'taskupdate', data);
  });
}

function updateTaskPut(event, planitId, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/planits/' + planitId + '/tasks/' + id,
    method: 'put',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewTask(planitId, id);
  });
}

function deleteTask(planitId, id) {
  customConfirm('Are you sure you want to delete this task?', function() {
    $.ajax({
      url: '/planits/' + planitId + '/tasks/' + id,
      method: 'delete',
      xhrFields: {
        withCredentials: true
      }
    }).done(function(data) {
      if (id == appvars.user.id) {
        logout();
      } else {
        viewPlanit(planitId);
      }
    });
  });
}

function selectSkill(id) {
  $('.skill').val(id);
  var skill = findBy(appvars.skills, 'id', id).name;
  $('.skill-btn').html(skill + '<span class="caret"></span>');
  var $description = $('.optional-description');
  if (skill == 'other') {
    $description.removeClass('hidden');
  } else {
    $description.addClass('hidden');
    $description.val('');
  }
}

function validatePlanitForm(then) {
  if(!highlightTitle() ||
      !highlightBudget() ||
      !highlightDate() ||
      !highlightPastDate() ||
      !highlightAddress() ||
      !highlightCity() ||
      !highlightZip() ||
      !highlightDescription()) {
  } else {
    then();
  }
}

function validateTaskForm(then) {
  if(!highlightTitle() ||
      !highlightBudget() ||
      !highlightDate() ||
      !highlightPastDate() ||
      !highlightAddress() ||
      !highlightCity() ||
      !highlightZip() ||
      !highlightDescription()) {
  } else {
    then();
  }
}

function validateProposalForm(then) {
  if(!highlightTitle() ||
      !highlightBudget() ||
      !highlightDate() ||
      !highlightPastDate() ||
      !highlightAddress() ||
      !highlightCity() ||
      !highlightZip() ||
      !highlightDescription()) {
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

function highlightCategory(){
  var ben = ($('.ben-will-murder-you-if-remove-this-class-category'))
  console.log($('.ben-will-murder-you-if-remove-this-class-category').text())
  if (!!$('.ben-will-murder-you-if-remove-this-class-category').text().match(/category/gi)) {
    $('span[class="planit-type planit-type-error error-text"]').remove();
    $('.planit-type').removeClass('error-highlight');
    return true;
  }
  else {
    $('span[class="planit-type-error error-text"]').remove();
    $('label[for="category"]').append('<span class="planit-type-error error-text"> Category Required.</span>');
    $('.planit-type').addClass('error-highlight');
  return false;
  }
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
