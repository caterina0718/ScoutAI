function scoutAccelerators(count = 10) {
  /*
  Retrieve 10 European accelerators that have not been extracted yet.
  Scrape the internet for accelerators using the OpenRouter API for up to 5 times. After each attempt, wait for 30 seconds to avoid surpassing the request limit. For each set of retrieved accelerators, discard the ones that already exist in the sheet and search again until a batch of 10 has been formed.
  */
  const existingUrls = new Set(getExistingUrls());
  const newAccelerators = [];
  const MAX_ATTEMPTS = 5;
  const RETRY_DELAY_MS = 3000;

  let attempts = 0;
  while (newAccelerators.length < count && attempts < MAX_ATTEMPTS) {
    attempts++;
    const remaining = count - newAccelerators.length;
    try {
      const raw = callOpenRouter(PROMPTS.scoutAccelerators(remaining));
      const cleaned = cleanJsonOutput(raw);
      const results = JSON.parse(cleaned);
      SpreadsheetApp.getUi().alert(results)
      results.forEach(acc => {

        if (acc.website && !existingUrls.has(acc.website) && newAccelerators.length < count) {
          existingUrls.add(acc.website);
          newAccelerators.push(acc);
        }
      });
    } catch (err) {
      console.log(`Attempt ${attempts} failed: ${err.message}`);
    }
    if (newAccelerators.length < count && attempts < MAX_ATTEMPTS) Utilities.sleep(RETRY_DELAY_MS);
  }

  if (newAccelerators.length > 0) insertAccelerators(newAccelerators);
  return newAccelerators;
}

function insertAccelerators(dataArray) {
  /*
  Append newly found accelerators to the 'accelerators' tab.
  The function receives a JSON array with information about each newly found accelerator and appends a new row for each accelerator.
  Each entry in the array has the following keys: website (URL), name, country. 
  If no column headers are found in the Google Sheet, the keys in the JSON are used as headers. 
  */
  try {
    const acceleratorSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('accelerators');
    if (!acceleratorSh) throw new Error("Sheet 'accelerators' not found");

    const headers = Object.keys(dataArray[0]);
    if (acceleratorSh.getLastRow() === 0) acceleratorSh.getRange(1, 1, 1, headers.length).setValues([headers]);

    const rows = dataArray.map(item => headers.map(h => item[h] || ""));
    acceleratorSh.getRange(acceleratorSh.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  } catch (err) {
    console.log("Error in insertAccelerators:", err.message);
  }
}
