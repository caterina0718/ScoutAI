function onOpen() {
  // Create a custom menu with 3 functions
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('ScoutingAI')
    .addItem('🔍 Scout accelerators', 'menuScout') // retrieve new accelerators
    .addSeparator()
    .addItem('🔄 Update startups', 'menuAggiorna') // update start-up list
    .addItem('✨ Generate value propositions', 'menuGeneraVP') // create value propositions where missing
    .addToUi();
}