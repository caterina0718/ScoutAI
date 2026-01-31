# ScoutingAI - Accelerator and Startup Discovery
This is a Google Apps Script project which automatically scouts new European accelerators and retrieves the participating start-ups. Using the OpenRouter API, a free, multi-lingual LLM is used to scrape online information and generate value propositions for the retrieved start-ups.

## Components
There are 2 main components:
- a Google Sheet with 2 tabs:
	- accelerators – stores accelerator information (website, name, country)

	- start-up – stores startup information (name, website, country, value proposition, accelerator)

- Apps Script documents that can be found in the repository or via the Google Sheet -> Extensions -> Apps Script

## Project setup
To be able to run the project, you need to perform the following steps:
1. Open the Google Sheet: 
2. Access Extensions -> Apps Script-> Project settings, then add a new Script property:
	OPEN_ROUTER_API -> <your-open-router-api>
3. Return to the Google Sheet and perform one or multiple of the actions described below.

## Functionality
Three main functions have been created, which can be accessed from the custom menu:
- scout accelerators: this searches for 10 accelerators that do not yet exist in the list and appends them at the end of the list
- update start-ups: for each accelerator in the list, all participating start-ups are retrieved together with the available information
- generate value proposition: for each start-up that doesn't already have a written value proposition, a new one is written (in the format "Startup <X> helps <Target Y> do <What W> so that <Benefit Z>") and inserted in the document. 

Additionally, any access errors are logged and skipped, allowing a smooth user experience. 

## Recommended Workflow

Run Scout accelerators (to populate the) accelerators tab -> 
run Add startups (to populate the start-up tab) -> 
run Generate value propositions (to fill in missing VP for startups) -> 
happy reading!

## Technical choices
- OpenRouter: provides a unified API for several free, multilingual LLMs, which increases performance in retrieving information written in various languages. Moreover, it remains flexible, allowing users to choose their preferred LLM;
- accelerator identification: name-based instead of URL-based for better identification and deduplication across languages
- error handling via console.log: the script does not halt upon failure and errors are automatically stored on Cloud
- automatic insertions: headers are automatically inserted
- constricted LLM output: LLMs are constricted to return JSON formatted answers, which has several advantages: it creates a semi-structured data structure which ensures that content extraction and storage are more consistent and efficient, it helps maintain the consistency of LLM answers. 
- modular functions stored in several files: prompts can be easily modified, functions can be reused and extended, LLM models can be seamlessly changed;
- API keys saved as ScriptProperties: safe access to sensitive data.

## Strong points
- Modular functions: the script is very flexible, allowing prompts, LLM models and functions to be easily modified and expanded.
- Safe execution: handles gracefully missing values, missing sheets, inaccessible web pages, API errors. 
- Idempotent & repeatable: re-running scripts does not create duplicate websites.

## Limitations
- extensive testing has not been performed;
- depending on the availability of LLM providers via the OpenRouter API, some models are temporarily unavailable and the higher quality ones are paid;
- no start-ups are found for many accelerators so web scraping can be greatly improved;
- prompt engineering should be further applied: techniques such as Few-shot prompting may help improve the retrieval of start-up information from accelerator websites.
