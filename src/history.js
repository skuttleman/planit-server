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
