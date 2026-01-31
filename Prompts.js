const CONFIG = {
  API_KEY: PropertiesService.getScriptProperties().getProperty("OPEN_ROUTER_API"),
  MODEL: "arcee-ai/trinity-large-preview:free",
  STARTUPS_MODEL: "arcee-ai/trinity-large-preview:free"
};

const PROMPTS = {
  scoutAccelerators: (count = 5) =>
    `Give me ${count} business incubators or business accelerators in Europe and return only a JSON array of objects with the type {website: "", name: "", country:""}. Search accelerators in all countries of Europe, regardless of the language of posting. ONLY RETURN THE VALID JSON.`,

  retrieveStartUps: (accelerator) =>
    `For ${accelerator}, return a list of all the start-ups that are currently part of the accelerator. ` +
    `Return ONLY the list, as a JSON array with keys "website" (url), "name", "country", "value_proposition" (if explicitly written).`,

  extractStartUpsFromHTML: (html) =>
    `Extract all startups from this HTML page: ${html}. For each start-up, return a JSON array with keys ` +
    `"website" (url), "name", "country", "value_proposition" (if explicitly written). DO NOT GUESS.`,

  generateVP: (startUpName) =>
    `Search online for information about this startup: ${startUpName}. Generate their value proposition in this format: ` +
    `"Startup <X> helps <Target Y> do <What W> so that <Benefit Z>". Return ONLY the value proposition.`
};
