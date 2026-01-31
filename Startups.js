function retrieveStartUps(acceleratorName) {
  /*
  Call the OpenRouter API to retrieve all the start-ups that participate in accelerator acceleratorName.
  */
  try {
    // Use accelerator NAME instead of URL in the prompt
    const prompt = PROMPTS.retrieveStartUps(acceleratorName);
    // Retrieve the LLM response
    const raw = callOpenRouter(prompt, CONFIG.STARTUPS_MODEL);
    if (!raw) return "[]"; // return an empty string if no response is provided
    return raw;
  } catch (err) {
    console.log(`Error in retrieveStartUps for "${acceleratorName}":`, err.message);
    return "[]";
  }
}

function getStartUpsFromHTML(URL) {
  /*
  Call the OpenRouter API and retrieve all start-ups that can be found on the website acccessible via a passed URL.
  */
  try {
    // Retrieve the accelerator webpage via its URL
    const html = UrlFetchApp.fetch(URL).getContentText();

    // Only send a small chunk of the HTML to OpenRouter
    const htmlChunk = html.slice(0, 3000); 

    // Retrieve all participating start-up
    const prompt = PROMPTS.extractStartUpsFromHTML(htmlChunk); // select the corresponding prompt
    return callOpenRouter(prompt, CONFIG.STARTUPS_MODEL);
  } catch (err) {
    console.log("Error in getStartUpsFromHTML:", err.message);
    return "[]";
  }
}

function insertStartUps(jsonString, acceleratorName) {
  /*
  Insert all the newly scraped start-ups in the start-up tab, for a given accelerator.
  The function receives a JSON with information about each start-up that participates in acceleratorName and appends a new row for each start-up.
  Each entry in the variable has the following keys: website (URL), name, country, value proposition (may be empty). 
  If no column headers are found in the Google Sheet, the keys in the JSON are used as headers. 
  */
  try {
    // Clean the JSON response 
    const dataArray = JSON.parse(cleanJsonOutput(jsonString));

  	// Retrieve the start-up tab throwing an error if not found
    const startupSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('start-up');
    if (!startupSh) throw new Error("Sheet 'start-up' not found");

    // Check if the headers already exist. If no "accelerator" column exists, add it
    const headers = Object.keys(dataArray[0] || {}); 
    if (!headers.includes("accelerator")) headers.push("accelerator");

    // Use the JSON keys as column headers if none exist
    if (startupSh.getLastRow() === 0) startupSh.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Append the start-up information in the sheet, allocating one row for each start-up
    const rows = dataArray.map(item => headers.map(h => h === "accelerator" ? acceleratorName : item[h] || "")); // leave empty any column that doest match the keys
    startupSh.getRange(startupSh.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  } catch (err) {
    console.log("Error in insertStartUps:", err.message);
  }
}

function generateVP(startUpName) {
  /*
  Use the OpenRouter API to generate a value proposition in the format "Startup <X> helps <Target Y> do <What W> so that <Benefit Z> for startup startUpName."
  */
  try {
    // Call the OpenRouter API and retrieve a value proposition
    return callOpenRouter(PROMPTS.generateVP(startUpName), CONFIG.STARTUPS_MODEL);
  } catch (err) {
    console.log(`Error in generateVP for "${startUpName}":`, err.message);
    return "";
  }
}

function insertValueProps(valueProp, startUpId) {
  /*
  Insert newly generated value propositions (passed as valueProp) for a given start-up (startUpId), in the correct column."
  */
  try {
    // Retrieve the start-up tab
    const startupSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('start-up'); 
    // Insert the passed ValueProp in the 4th column, on the correct row.
    startupSh.getRange(startUpId + 1, 4).setValue(valueProp);
  } catch (err) {
    console.log("Error in insertValueProps:", err.message);
  }
}
