function createProposal() {
  $.ajax({
    url: '/proposals/',
    method: 'post'
  }).done(function(details){
    appvars.proposal_details = details.proposal_details
  var data = {
    proposal_details: appvars.proposal_details,
    title: 'Proposal Creation',
    cost_estimate: cost_estimate,
    };

    //?unsure about proposal update template

  displayTemplate('main', 'proposalupdate', data);
  })
}

function createProposalPost(event, id) {
  if (event) event.preventDefault();
  var formData = getFormData('form');
  $.ajax({
    url: '/proposals',
    method: 'post',
    data: formData,
    xhrFields: {
      withCredentials: true
    }
  }).done(function(data) {
    viewProposal(data.proposals[0].id);
  }).fail(function(err){
    customAlert('All filed must be filled out to create a proposal')
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

function viewProposal(id) {
  $.ajax({
    url: '/proposals/' + id,
    method: 'get'
  }).done(function(proposals) {
    data = {
      proposal: proposals.proposals[0],
      //? tasks: Tasks.tasks,
      user: appvars.user,
      editable: appvars.user && (appvars.user.id == proposals.proposals[0].member_id || appvars.user.role_name == 'admin'),
      deletable: appvars.user && (appvars.user.id == proposals.proposals[0].member_id || appvars.user.role_name !== 'normal')
    };
    displayTemplate('main', 'proposal', data);
  });
}

// May be a mistake

function updateProposal(id) {
  Promise.all([
  $.ajax({
    url: '/proposals/' + id,
    method: 'get'
  }),
  $.ajax({
    url: '/proposal/details',
    method: 'get'
    })
  ]).then(function(data) {
    appvars.proposal_details = data[1].proposal_details;
    var proposal = data[0].proposals[0];
    var data = {
      proposals: proposal,
      proposal_details: data[1].proposal_details,
      title: 'Proposal Update',
      update: true,
      cost_estimate: cost_estimate,
    };
    displayTemplate('main', 'proposalupdate', data);
  });
}


//Unsure if id is needed as well

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

function deleteProposal(id) {
  customConfirm('Are you sure you want to delete this proposal?', function() {
    $.ajax({
      url: '/proposals/' + id,
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
