function callOpenRouter(prompt, model = CONFIG.MODEL) {
  /*
  Generic function used for calling a model of choice via the OpenRouter API.
  The prompt must be passed as an argument; the model can be changed.
  API-KEYS are retrieved from the Script Properties. 
  */
  try {
    // If no prompt has been passed, abort.
    if (!prompt) throw new Error("Missing prompt.");

    // If a valid prompt has been passed, set the configuration for making the LLM call.
    const API_KEY = CONFIG.API_KEY;
    if (!API_KEY) throw new Error("OpenRouter API key not set.");

    const endpoint = "https://openrouter.ai/api/v1/chat/completions"; // API endpoint

    const payload = {
      model: model, 
      messages: [
        {
          role: "user",
          content: String(prompt)
        }
      ],
      temperature: 0.2 // low creativeness to ensure consistency
    };

    const options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://docs.google.com", // OpenRouter required property
        "X-Title": "ScoutingAI" 
      },
      payload: JSON.stringify(payload), // Enforce JSON format
      muteHttpExceptions: true // skip unsuccessful http retrieval attempts
    };

    // Retrieve the LLM response and the completion code
    const response = UrlFetchApp.fetch(endpoint, options);
    const code = response.getResponseCode();
    const text = response.getContentText();

    if (code !== 200) {
      // Any unsuccessful attempts will be logged
      console.log(`OpenRouter error ${code}: ${text}`);
      return "";
    }

    // If successful, convert the returned text to JSON for further analysis
    const json = JSON.parse(text);
    if (json.choices && json.choices.length > 0 && 
       json.choices[0].message && json.choices[0].message.content) 
    { // Ensure that content has been returned and keep only the text (no metadata)
      return json.choices[0].message.content.trim();
    }

    console.log("No content returned from OpenRouter.");
    return "";

  } catch (err) {
    console.log("Error in callOpenRouter:", err.message);
    return "";
  }
}

function normalizeUrl(url) {
  /*
  Normalise URLs before adding them to the Google Sheet to deduplicate more efficiently and visually declutter.
  Normalisation requires removing initial prefixes (www, http, https) and replacing special characters, using RegEx.
  */
  if (!url) return "";
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .trim();
}

function cleanJsonOutput(rawString) {
  /*
  Clean LLM responses to return only a JSON compatible variable. 
  */
  if (!rawString) return "[]"; // if no text is passed
  if (rawString.startsWith("```json")) rawString = rawString.slice(7); // remove the initial text
  if (rawString.endsWith("```")) rawString = rawString.slice(0, -3); // remove final backticks
  return rawString.trim(); // remove excess white spaces from the beginning and end (if any)
}

function getExistingUrls(sheetName = 'accelerators') {
  /*
  Retrieve all existing URLs from a given Google Sheet.
  */
  try {
    // Retrieve the last filled row in the sheet
    const currentSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const lastRow = currentSh.getLastRow();

    // If there is no information, return (because there are no URLs)
    if (lastRow < 2) return [];

    // Otherwise, extract all information in the URL column and return the values as an array of Strings
    const data = currentSh.getRange(2, 1, lastRow - 1, 1).getValues();
    return data.flat().filter(String);
  } catch (err) {
    console.log("Error in getExistingUrls:", err.message);
    return [];
  }
}
