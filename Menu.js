function menuScout() {
  /*
  Retrieve 10 European accelerators which do not already exist in the list.
  */
  const newAccs = scoutAccelerators(10);
  SpreadsheetApp.getUi().alert(`Found ${newAccs.length} new accelerators.`); // announce the user that the task is finished
}

function menuAggiorna() {
  /*
  Iterate through the list of accelerators and for each of them (if any), retrieve the list of participating start-ups.
  The old entries are cleared from the start-up tab and new values are inserted.
  */
  try {
    // Retrieve the index of the last row of information in the start-up sheet
    const acceleratorSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('accelerators');
    const lastRow = acceleratorSh.getLastRow();

    // If no accelerator exists, abort the action.
    if (lastRow < 2) return;

    // Clear all existing start-ups (if any)
    if (lastRow > 1) {
      acceleratorSh.getRange(2, 1, lastRow - 1, acceleratorSh.getLastColumn()).clearContent();
    }

    // Retrieve existing accelerator names and the links to their websites
    const urls = acceleratorSh.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    const names = acceleratorSh.getRange(2, 2, lastRow - 1, 1).getValues().flat();

    urls.forEach((url, i) => {
      // For each accelerator, call the OpenRouterAPI and retrieve all participating start-ups. 
      const startups = getStartUpsFromHTML(url);
      insertStartUps(startups, names[i]); // insert the found information
    });
  } catch (err) {
    console.log("Error in menuAggiorna:", err.message);
  }
}

function menuGeneraVP() {
  /*
  For each start-up in the list that doesn't have a value proposition,
  insert a value proposition in the format: "Startup <X> helps <Target Y> do <What W> so that <Benefit Z>".
  */
  try {
    // Retrieve the index of the last row of information in the start-up sheet
    const startupSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('start-up');
    const lastRow = startupSh.getLastRow();

    // If no start-ups have been added yet, abort the action
    if (lastRow < 2) return;

    // Retrieve existing start-up names and their value propositions
    const names = startupSh.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    const valueProps = startupSh.getRange(2, 4, lastRow - 1, 1).getValues();

    names.forEach((name, i) => {
      if (!valueProps[i][0]) {
        // For each start-up missing a value proposition, call the OpenRouterAPI and generate one.
        const vp = generateVP(name);
        insertValueProps(vp, i + 1); //insert the value proposition in GoogleSheets
      }
    });
  } catch (err) {
    console.log("Error in menuGeneraVP:", err.message);
  }
}