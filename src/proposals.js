function createProposal(planitId, taskId) {
  $.ajax({
    url: '/planits/' + planitId + '/tasks/' + taskId,
    method: 'get'
  }).done(function(details){
    console.log(taskId)
    appvars.task = details.tasks[0]
  var data = {
    task: appvars.task,
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

function listProposals() {
  $.ajax({
    url: '/proposals',
    method: 'get'
  }).done(function(proposals) {
    Proposals.user = appvars.user;
    displayTemplate('main', 'proposals', proposals);
  });
}

function viewProposal(planitId, taskId, id) {
  $.ajax({
    url: '/proposals/' + id,
    method: 'get'
  }).done(function(proposals) {
    data = {
      proposal: proposals.proposals[0],
      planitId: planitId,
      taskId: taskId,
      user: appvars.user,
      editable: appvars.user && (appvars.user.id == proposals.proposals[0].member_id || appvars.user.role_name == 'admin'),
      deletable: appvars.user && (appvars.user.id == proposals.proposals[0].member_id || appvars.user.role_name !== 'normal')
    };
    displayTemplate('main', 'proposal', data);
  });
}

function updateProposal(planitId, taskId, id) {
  Promise.all([
  $.ajax({
    url: '/planits/' + planitId + '/tasks/' + taskId + '/proposals/' + id,
    method: 'get'
  }),
  $.ajax({
    url: '/proposal/details',
    method: 'get'
  }),
    $.ajax({
      url: '/tasks' + taskId,
      method: 'get'
      })
  ]).then(function(serverData) {
    appvars.task = serverData[2].tasks;
    appvars.proposal_details = data[1].proposal_details;
    var proposal = serverData[0].proposals[0];
    var data = {
      proposal: proposals.proposals[1],
      planitId: planitId,
      task: appvars.task,
      taskId: taskId,
      title: 'Proposal Update',
      update: true,
      user: appvars.user,
    };
    displayTemplate('main', 'proposalupdate', data);
  });
}

function updateProposalPut(event, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/proposals/' + id,
    method: 'put',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewProposal(id);
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

function acceptedProposal(id){

}

function rejectedProposal(id){


}
