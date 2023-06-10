// Zuna Browser Extenson
// Javascript required the Options page

// console.log("Options Page has been called")
/* globals window */
// Allows for cross-browser compatibility
window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

var optionsPage = {
  /******** 3. Creates Description Elements **********/
  parseDescription: function () {
    try {
      var divElem = document.createElement('h3');
      divElem.innerHTML = JSON.parse(localStorage.zunnaConfig).extensionDescription;
      document.getElementById('zunnaDescription').appendChild(divElem)
    } catch (e) {
      console.error("Options Page: Description couldn't be parsed \n", e)
      return { redirectUrl: window.browser.extension.getURL("../html/resetConfig.html")};
    }
  },
  /******** Creates Description Elements End **********/

  /******** Updates User Settings Toggles **********/
  updateUserSettings: function () {
    try {
      phrase = JSON.stringify(document.getElementById("meaningfulPhrase").value);
      number = JSON.stringify(document.getElementById("meaningfulNumber").value);
      chr = JSON.stringify(document.getElementById("meaningfulSpecialChr").value);
      JSON.parse(localStorage.zunnaConfig).userDetailsArray = [phrase, number, chr]
    } catch (e) {
      console.error("Pop up: User Settings couldn't be updated \n", e)
      return { redirectUrl: window.browser.extension.getURL("../html/resetConfig.html")};
    }
  },
  /******** Updates User Settings Toggles End **********/

  /******** 2. Loads optionsPage with Config contents **********/
  optionsPageMain: function () {
    // Call each function to display aspect of optionsPage
    optionsPage.parseDescription()
  }
}

/******** Listens for user to Click Reset Configuration File **********/
document.getElementById("resetConfig").addEventListener("click", function () {
  //Sends a message to the Background.js to reset the config
  window.browser.runtime.sendMessage({ fn: "resetConfigMsg" })
})


/******** Listens for user to Click Update User Details **********/
document.getElementById("updateUserDetails").addEventListener("click", function () {
  optionsPage.updateUserSettings()
})

/******** 1. Calls when optionsPage is clicked **********/
optionsPage.optionsPageMain()
